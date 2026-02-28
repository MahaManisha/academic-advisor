// server/src/modules/studyPlanner/studyPlanner.routes.js
import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { generate, updateTask, getTasks } from "./studyPlanner.controller.js";

const router = Router();

router.get("/tasks", authMiddleware, getTasks);

router.post("/generate", authMiddleware, generate);
router.patch("/:planId/task/:taskId", authMiddleware, updateTask);

export default router;
