import { Router } from "express";
import UserController from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(UserController.registerUser);
router.route("/jwt").post(UserController.issueJWT);
router.route("/refresh-access-token").post(UserController.refreshAccessToken);
router.route("/logout").post(UserController.logoutUser);

export default router;
