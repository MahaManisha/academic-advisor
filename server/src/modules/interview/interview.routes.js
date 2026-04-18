import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { getQuestions, getRounds } from "./interview.controller.js";

const router = Router();

// Protect routes if you want only authenticated users to access
router.use(authMiddleware);

// POST /api/interview/rounds
router.post("/rounds", getRounds);

// POST /api/interview/questions
router.post("/questions", getQuestions);

export default router;
