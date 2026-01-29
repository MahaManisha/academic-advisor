// server/src/modules/peer/peerChat.model.js
import mongoose from "mongoose";

const peerChatSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],

    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        message: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("PeerChat", peerChatSchema);
