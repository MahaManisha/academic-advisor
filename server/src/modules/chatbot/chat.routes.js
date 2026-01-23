import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { chat } from "./chat.controller.js";

const router = Router();

router.post("/", authMiddleware, chat);

export default router;
