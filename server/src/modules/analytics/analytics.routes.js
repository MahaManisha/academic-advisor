import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  generate,
  getAnalytics
} from "./analytics.controller.js";

const router = Router();

router.post("/:domain/generate", authMiddleware, generate);
router.get("/", authMiddleware, getAnalytics);

export default router;
