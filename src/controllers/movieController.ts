import { NextFunction, Request, Response } from "express";
import axios from "axios";
import Movie from "../models/Movies";
import logger from "../config/logger";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../utils/AppError";
import { moviesCreatedTotal } from "../config/metrics";
import { Op } from "sequelize";

export const getAllMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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

    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      pageSize: limit,
      movies: rows,
    });
  } catch (error) {
    logger.error({ error }, "Error retrieving movies");
    next(error);
  }
};

export const getMovieById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id);
    if (!movie) {
      throw new AppError(404, "Movie not found");
    }
    res.status(200).json(movie);
  } catch (error) {
    logger.error({ error }, `Error retrieving movie with id ${req.params.id}`);
    next(error);
  }
};

export const createMovie = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== "admin") {
      throw new AppError(403, "Forbidden: Only admins can add movies");
    }

    const movie = await Movie.create(req.body);
    moviesCreatedTotal.inc({ source: "direct" });
    res.status(201).json(movie);
  } catch (error: any) {
    logger.error({ error }, "Error creating movie");
    if (error.name === "SequelizeValidationError") {
      return next(
        new AppError(400, error.errors.map((e: any) => e.message).join(", "))
      );
    }
    next(error);
  }
};

export const createMovieByImdbId = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== "admin") {
      throw new AppError(403, "Forbidden: Only admins can add movies");
    }

    const { imdbId } = req.body;
    if (!imdbId) throw new AppError(400, "imdbId is required");

    const existingMovie = await Movie.findOne({ where: { imdbId } });
    if (existingMovie)
      throw new AppError(409, "Movie already exists in database");

    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) throw new AppError(500, "OMDB API Key is not configured");

    const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbId}`;

    let omdbResponse;
    try {
      omdbResponse = await axios.get(url);
    } catch (error) {
      throw new AppError(
        503,
        "External Movie Service is temporarily unavailable"
      );
    }

    if (omdbResponse.data.Response === "False")
      throw new AppError(404, `OMDB: ${omdbResponse.data.Error}`);

    const movie = omdbResponse.data;

    const newMovie = await Movie.create({
      title: movie.Title,
      imdbId: movie.imdbID,
      year: parseInt(movie.Year),
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

    res.status(201).json(newMovie);
  } catch (error: any) {
    logger.error({ error }, "Error creating movie by IMDb ID");
    if (error.name === "SequelizeValidationError") {
      return next(
        new AppError(400, error.errors.map((e: any) => e.message).join(", "))
      );
    }
    next(error);
  }
};

export const updateMovie = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== "admin") {
      throw new AppError(403, "Forbidden: Only admins can update movies");
    }

    const { id } = req.params;
    const [updatedRows] = await Movie.update(req.body, {
      where: { id },
    });

    if (updatedRows) {
      const updatedMovie = await Movie.findByPk(id);
      res.status(200).json(updatedMovie);
    } else {
      throw new AppError(404, "Movie not found");
    }
  } catch (error: any) {
    logger.error({ error }, `Error updating movie with id ${req.params.id}`);
    if (error.name === "SequelizeValidationError") {
      return next(
        new AppError(400, error.errors.map((e: any) => e.message).join(", "))
      );
    }
    next(error);
  }
};

export const deleteMovie = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== "admin") {
      throw new AppError(403, "Forbidden: Only admins can delete movies");
    }

    const { id } = req.params;
    const deletedRowCount = await Movie.destroy({
      where: { id },
    });

    if (deletedRowCount) {
      res.status(204).send();
    } else {
      throw new AppError(404, "Movie not found");
    }
  } catch (error) {
    logger.error({ error }, `Error deleting movie with id ${req.params.id}`);
    next(error);
  }
};
