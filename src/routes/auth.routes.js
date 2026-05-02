import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import AuthMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(UserController.registerUser);
router.route("/me").patch(AuthMiddleware.verifyJwt, UserController.updateUser);
router.route("/jwt").post(UserController.issueJWT);
router.route("/refresh-access-token").post(UserController.refreshAccessToken);
router.route("/logout").post(UserController.logoutUser);

export default router;
