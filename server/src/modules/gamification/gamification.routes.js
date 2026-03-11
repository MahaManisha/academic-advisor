// server/src/modules/gamification/gamification.routes.js
import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  reward,
  getStats,
  getLeaderboard
} from "./gamification.controller.js";

const router = Router();

router.post("/update", authMiddleware, reward);
router.post("/reward", authMiddleware, reward); // backward compatible
router.get("/me", authMiddleware, getStats);
router.get("/leaderboard", authMiddleware, getLeaderboard);

export default router;
