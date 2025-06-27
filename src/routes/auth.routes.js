import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import AuthMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(UserController.registerUser);
router.route("/jwt").post(UserController.issueJWT);
router.route("/refresh-access-token").post(UserController.refreshAccessToken);

export default router;
