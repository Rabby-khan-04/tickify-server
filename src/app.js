import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./utils/globalErrorHandler.js";

const app = express();

// middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes Import
import userRouter from "./routes/user.routes.js";
import theaterRouter from "./routes/theater.routes.js";
import showtimeRouter from "./routes/showtime.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import movieRouter from "./routes/movie.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import authRouter from "./routes/auth.routes.js";

// app.use("/", (req, res) => {
//   res.send(`Tckify Server is running!!`);
// });

// Router uses
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/theaters", theaterRouter);
app.use("/api/v1/showtimes", showtimeRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/movies", movieRouter);
app.use("/api/v1/bookings", bookingRouter);

// Global error handler
app.use(globalErrorHandler);

app.get("/", (req, res) => {
  res.send({ success: true });
});

export default app;
