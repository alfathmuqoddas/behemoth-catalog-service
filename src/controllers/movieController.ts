import { Request, Response } from "express";
import axios from "axios";
import Movie from "../models/Movies";
import logger from "../config/logger";
import { AuthRequest } from "../middleware/authMiddleware";

export const getAllMovies = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;

    const currentPage = page > 0 ? page : 1;
    const pageSize = size > 0 ? size : 10;

    const limit = pageSize;
    const offset = (currentPage - 1) * pageSize;

    const { count, rows } = await Movie.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]], // Optional: newest first
    });

    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      pageSize: limit,
      movies: rows,
    });
  } catch (error) {
    logger.error({ error }, "Error retrieving movies:");
    res.status(500).json({ message: "Error retrieving movies", error });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id);
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(404).json({ message: "Movie not found" });
    }
  } catch (error) {
    logger.error({ error }, `Error retrieving movie with id ${req.params.id}:`);
    res.status(500).json({ message: "Error retrieving movie", error });
  }
};

export const createMovie = async (req: AuthRequest, res: Response) => {
  try {
    // Only admin users can create movies
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admins can add movies" });
    }

    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    logger.error({ error }, "Error creating movie:");
    res.status(500).json({ message: "Error creating movie", error });
  }
};

export const createMovieByImdbId = async (req: AuthRequest, res: Response) => {
  try {
    // Only admin users can create movies
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admins can add movies" });
    }

    const { imdbId } = req.body;
    if (!imdbId) {
      logger.warn(`imdbId is required`);
      return res.status(400).json({ message: "imdbId is required" });
    }

    const existingMovie = await Movie.findOne({ where: { imdbId } });

    if (existingMovie) {
      return res
        .status(409)
        .json({ message: "Movie already exists in database" });
    }

    const apiKey = process.env.OMDB_API_KEY;
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbId}`;

    const response = await axios.get(url);
    const movie = response.data;

    if (movie.Response === "False") {
      return res.status(404).json({ message: `OMDB Error: ${movie.Error}` });
    }

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

    res.status(201).json(newMovie);
  } catch (error) {
    logger.error({ error }, "Error creating movie by imdbId:");
    res.status(500).json({ message: "Error creating movie", error });
  }
};

export const updateMovie = async (req: AuthRequest, res: Response) => {
  try {
    // Only admin users can update movies
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admins can update movies" });
    }

    const { id } = req.params;
    const [updatedRows] = await Movie.update(req.body, {
      where: { id },
    });

    if (updatedRows) {
      const updatedMovie = await Movie.findByPk(id);
      res.status(200).json(updatedMovie);
    } else {
      res.status(404).json({ message: "Movie not found" });
    }
  } catch (error) {
    logger.error({ error }, `Error updating movie with id ${req.params.id}:`);
    res.status(500).json({ message: "Error updating movie", error });
  }
};

export const deleteMovie = async (req: AuthRequest, res: Response) => {
  try {
    // Only admin users can delete movies
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admins can delete movies" });
    }

    const { id } = req.params;
    const deletedRowCount = await Movie.destroy({
      where: { id },
    });

    if (deletedRowCount) {
      res.status(204).send(); // No Content
    } else {
      res.status(404).json({ message: "Movie not found" });
    }
  } catch (error) {
    logger.error({ error }, `Error deleting movie with id ${req.params.id}:`);
    res.status(500).json({ message: "Error deleting movie", error });
  }
};
