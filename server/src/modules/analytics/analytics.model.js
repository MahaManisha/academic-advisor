// server/src/modules/analytics/analytics.model.js
import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    domain: String,

    skillLevel: String,

    accuracy: Number,

    scoreTrend: [Number], // historical scores

    weaknessAreas: [String],

    comparisonGroupAvg: Number,

    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Analytics", analyticsSchema);
