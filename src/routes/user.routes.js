import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import AuthMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router
  .route("/")
  .get(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyAdmin,
    UserController.getAllUser
  );
router.route("/me").get(AuthMiddleware.verifyJwt, UserController.getAUser);
router
  .route("/favorite/:movieId")
  .post(AuthMiddleware.verifyJwt, UserController.addFavoriteMovies);
router
  .route("/remove-favorite/:movieId")
  .post(AuthMiddleware.verifyJwt, UserController.removeMovieFromFavorites);

router
  .route("/favorites")
  .get(AuthMiddleware.verifyJwt, UserController.getFavoriteMovies);

export default router;
