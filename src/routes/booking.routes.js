import { Router } from "express";
import AuthMiddleware from "../middleware/auth.middleware.js";
import BookingController from "../controllers/booking.controller.js";

const router = Router();

router
  .route("/:date/:time")
  .post(AuthMiddleware.verifyJwt, BookingController.bookSeat);

router
  .route("/my")
  .get(AuthMiddleware.verifyJwt, BookingController.getMyBookings);

router
  .route("/my-booking-count")
  .get(AuthMiddleware.verifyJwt, BookingController.getBookingCount);

router
  .route("/my/:bookingId")
  .get(AuthMiddleware.verifyJwt, BookingController.getSpecificBooking);

router
  .route("/:showtimeId")
  .get(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyAdmin,
    BookingController.getBookingForShowtime
  );

router
  .route("/")
  .get(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyJwt,
    BookingController.getAllbookings
  );

export default router;
