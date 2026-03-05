import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { startStudySession, endStudySession, getStudyHistory } from "./study.controller.js";

const router = Router();

router.post("/start", authMiddleware, startStudySession);
router.post("/end", authMiddleware, endStudySession);
router.get("/history", authMiddleware, getStudyHistory);

export default router;
