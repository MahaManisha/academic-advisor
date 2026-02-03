import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { analyzeCourse } from "./nlp.controller.js";

const router = Router();

// Analyze course to personalize onboarding
router.post("/analyze-course", authMiddleware, analyzeCourse);

export default router;
