import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import {
    getOnboardingConfig,
    updateOnboardingConfig,
    getSystemConfig,
    updateSystemConfig
} from "./config.controller.js";

const router = Router();

router.get("/onboarding", authMiddleware, getOnboardingConfig);
router.put("/onboarding", authMiddleware, roleMiddleware("admin"), updateOnboardingConfig);

// System Config Routes
router.get("/system", authMiddleware, getSystemConfig);
router.put("/system", authMiddleware, roleMiddleware("admin"), updateSystemConfig);

export default router;
