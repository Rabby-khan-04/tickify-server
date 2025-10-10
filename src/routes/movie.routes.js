import { Router } from "express";
import AuthMiddleware from "../middleware/auth.middleware.js";
import MovieController from "../controllers/movie.controller.js";

const router = Router();

router.route("/now-playing").get(MovieController.getNowPlayingMovies);

router.route("/upcoming").get(
  // AuthMiddleware.verifyJwt,
  // AuthMiddleware.verifyAdmin,
  MovieController.getUpcomingMovies
);

router
  .route("/")
  .get(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyAdmin,
    MovieController.getAllMovies
  );

router
  .route("/movies-count")
  .get(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyAdmin,
    MovieController.getMoviesCount
  );

router.route("/:movieId").get(MovieController.getMovieDetails);
router.route("/movie/:movieId").get(MovieController.getMovieById);

export default router;
