// server/src/modules/analytics/analytics.routes.js
import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  generate,
  getAnalytics,
  getDashboardAnalytics
} from "./analytics.controller.js";

import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

// Admin Dashboard - Protected
router.get("/dashboard", authMiddleware, roleMiddleware(['admin']), getDashboardAnalytics);

router.post("/:domain/generate", authMiddleware, generate);
router.get("/", authMiddleware, getAnalytics);

export default router;
