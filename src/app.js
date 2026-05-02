import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./utils/globalErrorHandler.js";
import stripeWebhooks from "./controllers/stripe.webhook.js";
import { AllowedOrigins } from "./constants.js";

const app = express();

// Stripe Webhook
app.use(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks,
);

// middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || AllowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
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
import contactRouter from "./routes/contact.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

// Router uses
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/theaters", theaterRouter);
app.use("/api/v1/showtimes", showtimeRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/movies", movieRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.use("/", (req, res) => {
  res.send(`Tckify Server is running!!`);
});

// Global error handler
app.use(globalErrorHandler);

export default app;
