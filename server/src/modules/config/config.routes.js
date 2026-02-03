import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import { getOnboardingConfig, updateOnboardingConfig } from "./config.controller.js";

const router = Router();

router.get("/onboarding", authMiddleware, getOnboardingConfig);
router.put("/onboarding", authMiddleware, roleMiddleware("admin"), updateOnboardingConfig);

export default router;
