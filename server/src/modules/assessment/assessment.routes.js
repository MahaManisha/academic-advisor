// server/src/modules/assessment/assessment.routes.js
import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { start, submit, getOnboardingQuestions } from "./assessment.controller.js";

const router = Router();

// Route to get dynamic onboarding questions based on user's course
router.get("/onboarding-questions", authMiddleware, getOnboardingQuestions);

router.get("/:domain/start", authMiddleware, start);
router.post("/:domain/submit", authMiddleware, submit);

export default router;
