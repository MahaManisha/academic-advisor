import { Router } from "express";
import * as sessionController from "./session.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, sessionController.createSession);
router.get("/my", authMiddleware, sessionController.getMySessions);
router.patch("/:id", authMiddleware, sessionController.updateSessionStatus);
router.delete("/:id", authMiddleware, sessionController.deleteSession);

export default router;
