import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { start, submit } from "./assessment.controller.js";

const router = Router();

router.get("/:domain/start", authMiddleware, start);
router.post("/:domain/submit", authMiddleware, submit);

export default router;
