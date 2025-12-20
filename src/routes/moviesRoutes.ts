import { Router } from "express";
import { getAllMovies, getMovieById } from "../controllers/movieController";
import {
  createMovie,
  createMovieByImdbId,
  updateMovie,
  deleteMovie,
} from "../controllers/movieController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/getMovies", getAllMovies);
router.get("/getMovies/:id", getMovieById);
router.post("/add", authMiddleware, createMovie);
router.post("/addByImdbId", authMiddleware, createMovieByImdbId);
router.put("/update/:id", authMiddleware, updateMovie);
router.delete("/delete/:id", authMiddleware, deleteMovie);

export default router;
