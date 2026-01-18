import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import axios from "axios";
import Movie from "../models/Movies";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../utils/AppError";
import { moviesCreatedTotal } from "../config/metrics";
import logger from "../config/logger";
import { Op } from "sequelize";

export const getAllMovies = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.size as string) || 10);
  const title = req.query.title as string;

  const offset = (page - 1) * limit;

  const whereClause: any = {};
  if (title) {
    whereClause.title = { [Op.iLike]: `%${title}%` };
  }

  const { count, rows } = await Movie.findAndCountAll({
    limit,
    offset,
    where: whereClause,
    order: [["createdAt", "DESC"]],
  });

  logger.info(`Found ${count} movies with title filter: ${title || "none"}`);

  res.status(200).json({
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    pageSize: limit,
    movies: rows,
  });
});

export const getMovieById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const movie = await Movie.findByPk(id);
  if (!movie) {
    logger.warn(`Movie ${id} not found.`);
    throw new AppError(404, "Movie not found");
  }
  logger.info(`Movie ${id} found.`);
  res.status(200).json(movie);
});

export const createMovie = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      logger.warn(
        `User ${req.user?.userId} attempted to create a movie without authorization.`,
      );
      throw new AppError(403, "Forbidden: Only admins can add movies");
    }

    const movie = await Movie.create(req.body);
    moviesCreatedTotal.inc({ source: "direct" });
    logger.info(`Movie ${movie.id} created by user ${req.user?.userId}.`);
    res.status(201).json(movie);
  },
);

export const createMovieByImdbId = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      logger.warn(
        `User ${req.user?.userId} attempted to create a movie without authorization.`,
      );
      throw new AppError(403, "Forbidden: Only admins can add movies");
    }

    const { imdbId } = req.body;
    if (!imdbId) {
      logger.warn(`imdbId is not provided in the request body.`);
      throw new AppError(400, "imdbId is required");
    }

    if (!/^tt\d+$/.test(imdbId)) {
      logger.warn(`Invalid imdbId format: ${imdbId}`);
      throw new AppError(400, "Invalid imdbId format (e.g., tt1234567)");
    }

    const existingMovie = await Movie.findOne({ where: { imdbId } });
    if (existingMovie) {
      logger.warn(`Movie with imdbId ${imdbId} already exists in database.`);
      throw new AppError(409, "Movie already exists in database");
    }

    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
      logger.warn(`OMDB API Key is not configured.`);
      throw new AppError(500, "OMDB API Key is not configured");
    }

    const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbId}&plot=full`;

    //refactor
    let omdbResponse;
    try {
      omdbResponse = await axios.get(url);
    } catch (error) {
      throw new AppError(
        503,
        "External Movie Service is temporarily unavailable",
      );
    }

    if (omdbResponse.data.Response === "False") {
      logger.warn(`OMDB: ${omdbResponse.data.Error}`);
      throw new AppError(404, `OMDB: ${omdbResponse.data.Error}`);
    }

    const movie = omdbResponse.data;

    const newMovie = await Movie.create({
      title: movie.Title,
      imdbId: movie.imdbID,
      year: parseInt(movie.Year) || 0,
      rated: movie.Rated,
      released: movie.Released,
      runtime: movie.Runtime,
      genre: movie.Genre,
      director: movie.Director,
      writer: movie.Writer,
      actors: movie.Actors,
      plot: movie.Plot,
      poster: movie.Poster,
      imdbRating: movie.imdbRating !== "N/A" ? parseFloat(movie.imdbRating) : 0,
      boxOffice: movie.BoxOffice || "N/A",
    });

    moviesCreatedTotal.inc({ source: "imdb" });

    logger.info(
      `Movie ${newMovie.id} is succesfully added by user ${req.user?.userId}.`,
    );

    res.status(201).json(newMovie);
  },
);

export const updateMovie = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      logger.warn(
        `User ${req.user?.userId} attempted to update a movie without authorization.`,
      );
      throw new AppError(403, "Forbidden: Only admins can update movies");
    }

    const { id } = req.params;
    const [updatedRows] = await Movie.update(req.body, {
      where: { id },
    });

    if (updatedRows) {
      const updatedMovie = await Movie.findByPk(id);
      logger.info(`Movie ${id} updated by user ${req.user?.userId}.`);
      res.status(200).json(updatedMovie);
    } else {
      logger.warn(`Movie ${id} not found.`);
      throw new AppError(404, "Movie not found");
    }
  },
);

export const deleteMovie = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      throw new AppError(403, "Forbidden: Only admins can delete movies");
    }

    const { id } = req.params;
    const deletedRowCount = await Movie.destroy({
      where: { id },
    });

    if (deletedRowCount) {
      logger.info(`Movie ${id} deleted by user ${req.user?.userId}.`);
      res.status(204).send();
    } else {
      logger.warn(`Movie ${id} not found.`);
      throw new AppError(404, "Movie not found");
    }
  },
);
