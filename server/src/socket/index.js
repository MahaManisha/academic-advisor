// server/src/socket/index.js
import setupPeerSocket from "./peer.socket.js";
import setupChatSocket from "../modules/peer/chat.socket.js";

const setupSockets = (io) => {
  io.on("connection", (socket) => {


    // Legacy peer socket events (join-peer-room, peer-message)
    setupPeerSocket(io, socket);

    // Enhanced chat socket events (register_user, join_room, send_message, typing, seen)
    setupChatSocket(io, socket);

    socket.on("disconnect", () => {

    });
  });
};

export default setupSockets;
