// server/src/modules/recommendation/recommendation.model.js
import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    type: {
      type: String,
      enum: ["course", "peer", "resource"]
    },

    referenceId: mongoose.Schema.Types.ObjectId,

    domain: String,

    confidenceScore: {
      type: Number,
      min: 0,
      max: 1
    },

    reason: String,

    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Recommendation", recommendationSchema);
