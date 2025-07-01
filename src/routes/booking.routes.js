import { Router } from "express";
import AuthMiddleware from "../middleware/auth.middleware.js";
import BookingController from "../controllers/booking.controller.js";

const router = Router();

router
  .route("/:date/:time")
  .post(AuthMiddleware.verifyJwt, BookingController.bookSeat);

export default router;
