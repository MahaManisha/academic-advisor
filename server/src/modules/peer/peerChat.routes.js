// server/src/modules/peer/peerChat.routes.js
import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  getPeerSuggestions,
  getChatHistory
} from "./peerChat.controller.js";

const router = Router();

router.get("/suggest", authMiddleware, getPeerSuggestions);
router.get("/chat/:roomId", authMiddleware, getChatHistory);

export default router;
