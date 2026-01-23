import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { generate, list } from "./recommendation.controller.js";

const router = Router();

router.post("/generate", authMiddleware, generate);
router.get("/", authMiddleware, list);

export default router;
