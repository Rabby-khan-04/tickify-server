import { Router } from "express";
import AuthMiddleware from "../middleware/auth.middleware.js";
import DashboardController from "../controllers/Dashboard.controller.js";

const dashboardRouter = Router();

// GET /api/v1/dashboard/stats
dashboardRouter.get(
  "/stats",
  AuthMiddleware.verifyJwt,
  AuthMiddleware.verifyAdmin,
  DashboardController.getDashboardStats,
);

export default dashboardRouter;
