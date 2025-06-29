import { Router } from "express";
import AuthMiddleware from "../middleware/auth.middleware.js";
import TheaterController from "../controllers/theater.controller.js";

const router = Router();

router
  .route("/")
  .post(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyAdmin,
    TheaterController.addTheater
  );
router
  .route("/")
  .get(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyAdmin,
    TheaterController.getAllTheaters
  );
router
  .route("/:theaterId")
  .delete(
    AuthMiddleware.verifyJwt,
    AuthMiddleware.verifyAdmin,
    TheaterController.deleteTheater
  );

export default router;
