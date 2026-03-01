// server/src/modules/peer/peer.controller.js
import {
    getStudentList,
    sendConnectionRequest,
    respondToConnectionRequest
} from "./peer.service.js";
import { getMessages } from "./chat.service.js";
import { createNotification } from "../notification/notification.controller.js";

/**
 * GET /api/peers/list
 * Returns all students with their connection status relative to the logged-in user.
 */
export const getPeerList = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const students = await getStudentList(currentUserId);

        res.json({
            success: true,
            peers: students
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/peers/request/:id
 * Sends a connection request to the target user.
 */
export const sendRequest = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const targetUserId = req.params.id;

        const result = await sendConnectionRequest(currentUserId, targetUserId);

        // Notify target user
        const io = req.app.get('io');
        await createNotification({
            recipient: targetUserId,
            sender: currentUserId,
            type: "FRIEND_REQUEST",
            message: "🎉 New Ally Request!",
            relatedId: currentUserId,
            io
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/peers/respond
 * Accepts or rejects a connection request.
 * Body: { requesterId, action: "accept" | "reject" }
 */
export const respondRequest = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const { requesterId, action } = req.body;

        if (!requesterId || !action) {
            return res.status(400).json({
                success: false,
                message: "requesterId and action are required"
            });
        }

        const result = await respondToConnectionRequest(
            currentUserId,
            requesterId,
            action
        );

        if (action === "accept") {
            const io = req.app.get('io');
            await createNotification({
                recipient: requesterId,
                sender: currentUserId,
                type: "FRIEND_ACCEPTED",
                message: "🎉 Your ally request was accepted!",
                relatedId: currentUserId,
                io
            });
        }

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/peer/messages/:peerId
 * Returns chat message history with a specific peer.
 */
export const getChatMessages = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const peerId = req.params.peerId;

        const messages = await getMessages(currentUserId, peerId);

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        next(error);
    }
};
