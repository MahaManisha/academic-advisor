import PeerChat from "../modules/peer/peerChat.model.js";

const setupPeerSocket = (io, socket) => {
  socket.on("join-peer-room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket joined room: ${roomId}`);
  });

  socket.on("peer-message", async (data) => {
    const { roomId, sender, message } = data;

    const chat = await PeerChat.findOneAndUpdate(
      { roomId },
      {
        $push: {
          messages: { sender, message }
        }
      },
      { upsert: true, new: true }
    );

    io.to(roomId).emit("peer-message-received", chat);
  });
};

export default setupPeerSocket;
