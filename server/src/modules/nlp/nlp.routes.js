import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { analyzeCourse, extractSubjects } from "./nlp.controller.js";

const router = Router();

// Analyze course to personalize onboarding
router.post("/analyze-course", authMiddleware, analyzeCourse);

// Extract subjects from syllabus
router.post("/extract-subjects", authMiddleware, extractSubjects);

export default router;
