// server/src/socket/index.js
import setupPeerSocket from "./peer.socket.js";
import setupChatSocket from "../modules/peer/chat.socket.js";

const setupSockets = (io) => {
  io.on("connection", (socket) => {

    // Join a personal room for notifications
    socket.on("join", (userId) => {
      if (userId) {
        socket.join(userId.toString());
        console.log(`User ${userId} joined their personal notification room`);
      }
    });

    // Legacy peer socket events (join-peer-room, peer-message)
    setupPeerSocket(io, socket);

    // Enhanced chat socket events (register_user, join_room, send_message, typing, seen)
    setupChatSocket(io, socket);

    socket.on("disconnect", () => {
    });
  });
};

export default setupSockets;
