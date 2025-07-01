import { Router } from "express";
import AuthMiddleware from "../middleware/auth.middleware.js";
import MovieController from "../controllers/movie.controller.js";

const router = Router();

router
  .route("/now-playing")
  .get(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyAdmin,
    MovieController.getNowPlayingMovies
  );

router
  .route("/upcoming")
  .get(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyAdmin,
    MovieController.getUpcomingMovies
  );

router
  .route("/")
  .get(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyAdmin,
    MovieController.getAllMovies
  );

export default router;
