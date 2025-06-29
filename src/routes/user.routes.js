import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import AuthMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.route("/me").get(AuthMiddleware.verifyJwt, UserController.getAUser);

export default router;
