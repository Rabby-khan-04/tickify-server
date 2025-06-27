import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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
import screenRouter from "./routes/screen.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import movieRouter from "./routes/movie.routes.js";
import bookingRouter from "./routes/booking.routes.js";

app.use("/", (req, res) => {
  res.send(`Tckify Server is running!!`);
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/theater", theaterRouter);
app.use("/api/v1/showtime", showtimeRouter);
app.use("/api/v1/screen", screenRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/movie", movieRouter);
app.use("/api/v1/booking", bookingRouter);

export default app;
