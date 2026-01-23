import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { generate, updateTask } from "./studyPlanner.controller.js";

const router = Router();

router.post("/generate", authMiddleware, generate);
router.patch("/:planId/task/:taskId", authMiddleware, updateTask);

export default router;
