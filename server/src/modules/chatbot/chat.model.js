import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },

    message: {
      type: String,
      required: true
    },

    confidenceScore: {
      type: Number,
      min: 0,
      max: 1
    },

    fallbackSuggested: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
