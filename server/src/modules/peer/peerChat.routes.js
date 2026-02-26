// server/src/modules/peer/peerChat.routes.js
import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  getPeerSuggestions,
  getChatHistory
} from "./peerChat.controller.js";
import {
  getPeerList,
  sendRequest,
  respondRequest,
  getChatMessages
} from "./peer.controller.js";

const router = Router();

// ─── Existing Routes (unchanged) ───
router.get("/suggest", authMiddleware, getPeerSuggestions);
router.get("/chat/:roomId", authMiddleware, getChatHistory);

// ─── Peer Connection Routes ───
router.get("/list", authMiddleware, getPeerList);
router.post("/request/:id", authMiddleware, sendRequest);
router.post("/respond", authMiddleware, respondRequest);

// ─── Chat Messages Route ───
router.get("/messages/:peerId", authMiddleware, getChatMessages);

export default router;
