// server/src/modules/career/learningBehaviour.model.js
import mongoose from "mongoose";

const learningBehaviourSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    // 1. Raw Student Inputs
    inputs: {
      studyHours: { type: Number, required: true, min: 0, max: 80 },
      codingFrequency: { type: Number, required: true, min: 0, max: 4 }, // 0=Never .. 4=Daily
      projectInterest: { type: String, required: true, enum: ["Low", "Medium", "High"] },
      confidenceLevel: { type: Number, required: true, min: 1, max: 10 },
      mathConfidence: { type: Number, required: true, min: 1, max: 10 },
      learningMethod: { type: String, required: true, enum: ["Visual", "Hands-on", "Theoretical", "Mixed"] },
      handsOnVsTheory: { type: Number, required: true, min: 0, max: 100 }, // 0=Theory .. 100=HandsOn
      individualVsTeam: { type: Number, required: true, min: 0, max: 100 }, // 0=Solo .. 100=Team
      preferredStudyTime: { type: String, required: true, enum: ["Early Morning", "Afternoon", "Evening", "Late Night"] }
    },

    // 2. Calculated Fuzzy Outputs Only (0 to 100)
    fuzzyOutputs: {
      learningCommitment: { type: Number, required: true },
      programmingReadiness: { type: Number, required: true },
      studyConsistency: { type: Number, required: true },
      learningFlexibility: { type: Number, required: true },
      analyticalReadiness: { type: Number, required: true }
    },

    // 3. Mission Status
    completed: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("LearningBehaviour", learningBehaviourSchema);
