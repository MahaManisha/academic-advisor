import express from "express";
import * as mentorController from "./mentor.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Mentor specific routes (requires authentication)
router.post("/generate-assessment", authMiddleware, mentorController.generateAssessment);
router.post("/evaluate-assessment", authMiddleware, mentorController.evaluateAssessment);
router.get("/dashboard", authMiddleware, mentorController.getMentorDashboard);
router.get("/requests", authMiddleware, mentorController.getMentorRequests);
router.post("/respond", authMiddleware, mentorController.respondToRequest);
router.get("/students", authMiddleware, mentorController.getMentorStudents);

// Student accessible routes
router.get("/ranked", authMiddleware, mentorController.getRankedMentors);
router.post("/request", authMiddleware, mentorController.requestMentorship);
router.post("/feedback", authMiddleware, mentorController.submitFeedback);

export default router;
