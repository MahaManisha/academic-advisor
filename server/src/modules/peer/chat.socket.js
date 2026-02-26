// server/src/modules/peer/chat.socket.js
import { saveMessage, markMessagesSeen } from "./chat.service.js";

// Track online users: userId -> Set<socketId>
// Exported so other modules can check online status if needed
const onlineUsers = new Map();

/**
 * Check if a userId is currently online.
 */
export const isUserOnline = (userId) => {
    return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
};

/**
 * Setup all peer chat socket events.
 * Called once per socket connection from socket/index.js.
 */
const setupChatSocket = (io, socket) => {
    // ─── REGISTER USER (online tracking) ───
    socket.on("register_user", (userId) => {
        if (!userId) return;

        socket.userId = userId;

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

        // Broadcast to all clients that this user is online
        io.emit("user_online", userId);

        // Send the list of currently online users to the newly connected client
        const onlineList = [];
        for (const [uid, sockets] of onlineUsers.entries()) {
            if (sockets.size > 0) {
                onlineList.push(uid);
            }
        }
        socket.emit("online_users", onlineList);
    });

    // ─── JOIN ROOM ───
    socket.on("join_room", ({ roomId }) => {
        if (!roomId) return;
        socket.join(roomId);

    });

    // ─── SEND MESSAGE ───
    socket.on("send_message", async (data) => {
        try {
            const { roomId, senderId, receiverId, message } = data;

            if (!roomId || !senderId || !message) return;

            // Save to database via service
            const savedMsg = await saveMessage({
                roomId,
                senderId,
                receiverId,
                message
            });

            // Emit to everyone in the room (including sender for confirmation)
            io.to(roomId).emit("receive_message", {
                _id: savedMsg._id,
                sender: senderId,
                message: savedMsg.message,
                createdAt: savedMsg.createdAt,
                seen: false,
                roomId
            });
        } catch (error) {
            console.error("❌ Error saving message:", error.message);
            socket.emit("message_error", { error: "Failed to send message" });
        }
    });

    // ─── TYPING INDICATOR ───
    socket.on("typing", ({ roomId, userId }) => {
        if (!roomId || !userId) return;
        socket.to(roomId).emit("typing", { userId, roomId });
    });

    socket.on("stop_typing", ({ roomId, userId }) => {
        if (!roomId || !userId) return;
        socket.to(roomId).emit("stop_typing", { userId, roomId });
    });

    // ─── SEEN STATUS ───
    socket.on("seen", async ({ roomId, userId }) => {
        try {
            if (!roomId || !userId) return;

            await markMessagesSeen(roomId, userId);

            // Notify the other person their messages have been seen
            socket.to(roomId).emit("messages_seen", {
                roomId,
                seenBy: userId
            });
        } catch (error) {
            console.error("❌ Error marking seen:", error.message);
        }
    });

    // ─── DISCONNECT (offline tracking) ───
    socket.on("disconnect", () => {
        const userId = socket.userId;

        if (userId && onlineUsers.has(userId)) {
            onlineUsers.get(userId).delete(socket.id);

            // Only broadcast offline if no more active sockets for this user
            if (onlineUsers.get(userId).size === 0) {
                onlineUsers.delete(userId);
                io.emit("user_offline", userId);
            }
        }
    });
};

export { onlineUsers };
export default setupChatSocket;
