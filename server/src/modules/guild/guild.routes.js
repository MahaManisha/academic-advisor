import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
    getGuilds,
    createGuild,
    getGuildDetails,
    joinGuild,
    contributeMission
} from "./guild.controller.js";

const router = express.Router();

router.use(authMiddleware); // Ensure user is logged in
router.get("/", getGuilds);
router.post("/", createGuild);
router.get("/:id", getGuildDetails);
router.post("/:id/join", joinGuild);
router.post("/:id/contribute", contributeMission);

export default router;
