// server/src/routes.js
import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import studentProfileRoutes from "./modules/studentProfile/studentProfile.routes.js";
import assessmentRoutes from "./modules/assessment/assessment.routes.js";
import recommendationRoutes from "./modules/recommendation/recommendation.routes.js";
import studyPlannerRoutes from "./modules/studyPlanner/studyPlanner.routes.js";
import chatbotRoutes from "./modules/chatbot/chat.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import gamificationRoutes from "./modules/gamification/gamification.routes.js";
import peerRoutes from "./modules/peer/peerChat.routes.js";

const router = Router();

// Health check (no auth, fast response)
router.get("/health", (req, res) => {
  res.json({ status: "API is running" });
});

// Auth & core modules
router.use("/peer", peerRoutes);
router.use("/gamification", gamificationRoutes)
router.use("/analytics", analyticsRoutes);
router.use("/advisor", chatbotRoutes);
router.use("/planner", studyPlannerRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/assessments", assessmentRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/profile", studentProfileRoutes);

export default router;
