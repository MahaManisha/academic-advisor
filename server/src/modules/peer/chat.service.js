// server/src/modules/peer/chat.service.js
import PeerChat from "./peerChat.model.js";

/**
 * Save a message to the database.
 * Creates the chat room document if it doesn't exist yet (upsert).
 * Returns the saved message subdocument.
 */
export const saveMessage = async ({ roomId, senderId, receiverId, message }) => {
    const chat = await PeerChat.findOneAndUpdate(
        { roomId },
        {
            $setOnInsert: {
                participants: [senderId, receiverId]
            },
            $push: {
                messages: {
                    sender: senderId,
                    message,
                    seen: false,
                    createdAt: new Date()
                }
            }
        },
        { upsert: true, new: true }
    );

    // Return the last pushed message
    return chat.messages[chat.messages.length - 1];
};

/**
 * Get full message history between two users.
 * Computes roomId from sorted user IDs.
 */
export const getMessages = async (userId, peerId) => {
    const roomId = [userId, peerId].sort().join("_");

    const chat = await PeerChat.findOne({ roomId });

    if (!chat) {
        return [];
    }

    return chat.messages;
};

/**
 * Mark all messages from the OTHER user as seen.
 * Only marks messages where sender !== viewerId.
 */
export const markMessagesSeen = async (roomId, viewerId) => {
    await PeerChat.updateOne(
        { roomId },
        {
            $set: {
                "messages.$[elem].seen": true
            }
        },
        {
            arrayFilters: [
                {
                    "elem.sender": { $ne: viewerId },
                    "elem.seen": false
                }
            ]
        }
    );
};
export const deleteMessage = async (roomId, messageId) => {
    await PeerChat.updateOne(
        { roomId },
        {
            $pull: {
                messages: { _id: messageId }
            }
        }
    );
};
