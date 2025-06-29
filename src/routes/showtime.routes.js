import { Router } from "express";
import AuthMiddleware from "../middleware/auth.middleware.js";
import ShowtimeController from "../controllers/showtime.controller.js";

const router = Router();

router
  .route("/")
  .post(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyAdmin,
    ShowtimeController.addShow
  );

router
  .route("/")
  .get(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyAdmin,
    ShowtimeController.getAllShows
  );

export default router;
