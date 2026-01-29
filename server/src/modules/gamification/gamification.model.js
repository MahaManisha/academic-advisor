// server/src/modules/gamification/gamification.model.js
import mongoose from "mongoose";

const gamificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true
    },

    xp: {
      type: Number,
      default: 0
    },

    level: {
      type: Number,
      default: 1
    },

    badges: [String],

    streak: {
      type: Number,
      default: 0
    },

    lastActive: Date
  },
  { timestamps: true }
);

export default mongoose.model("Gamification", gamificationSchema);
