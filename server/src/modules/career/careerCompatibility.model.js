// server/src/modules/career/careerCompatibility.model.js
import mongoose from "mongoose";

const compatibilityDomainSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true },
    scorePercentage: { type: Number, required: true }, // e.g. 91 (for 91%)
    rank: { type: Number, required: true },
    breakdown: {
      academicScore: { type: Number, default: 0 },
      ahpScore: { type: Number, default: 0 },
      fuzzyScore: { type: Number, default: 0 },
      behaviourScore: { type: Number, default: 0 }
    }
  },
  { _id: false }
);

const careerCompatibilitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    // 1. Vector Inputs Availability Status
    vectorInputsUsed: {
      hasAcademic: { type: Boolean, default: false },
      hasInterest: { type: Boolean, default: false },
      hasFuzzy: { type: Boolean, default: false },
      hasBehaviour: { type: Boolean, default: false }
    },

    // 2. Multi-Vector Compatibility Matrix (All 12 Career Domains Ranked)
    compatibilityMatrix: [compatibilityDomainSchema],

    // 3. Top Matched Domain
    topDomain: { type: String, required: true },
    overallReadiness: { type: Number, default: 0 }, // 0 to 100

    // 4. Mission Status
    completed: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("CareerCompatibility", careerCompatibilitySchema);
