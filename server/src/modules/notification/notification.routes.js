import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead
} from "./notification.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getUserNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

export default router;
