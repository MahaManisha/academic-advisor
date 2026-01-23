import setupPeerSocket from "./peer.socket.js";

const setupSockets = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    setupPeerSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
};

export default setupSockets;
