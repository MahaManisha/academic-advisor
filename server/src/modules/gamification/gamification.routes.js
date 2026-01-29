// server/src/modules/gamification/gamification.routes.js
import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  reward,
  getStats
} from "./gamification.controller.js";

const router = Router();

router.post("/reward", authMiddleware, reward);
router.get("/me", authMiddleware, getStats);

export default router;
