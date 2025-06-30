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
  .route("/all")
  .get(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyAdmin,
    ShowtimeController.getAllShows
  );

router.route("/upcoming").get(ShowtimeController.getAllUpcomingShow);

export default router;
