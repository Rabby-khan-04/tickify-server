import { Router } from "express";
import ContactController from "../controllers/contact.controller.js";

const router = Router();

router.route("/submit").post(ContactController.submitContact);

export default router;
