// server/src/modules/career/cognitiveBehaviour.model.js
import mongoose from "mongoose";

const cognitiveBehaviourSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    // 1. Real-time Telemetry Metrics
    telemetry: {
      responseTimesMs: [{ type: Number }], // Milliseconds spent per challenge step
      totalDurationMs: { type: Number, default: 0 },
      choiceChangesCount: { type: Number, default: 0 }, // Number of times user changed options before confirming
      curiosityClicksCount: { type: Number, default: 0 }, // Number of info/tooltip cards expanded
      navigationFlipsCount: { type: Number, default: 0 }, // Backward navigation visits
      interactionSequence: [{ type: Object }] // Array of action log entries
    },

    // 2. Challenge Choices Recorded
    challengeResponses: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },

    // 3. Normalized 8-Dimensional Behaviour Vector
    // [Speed, Stability, Curiosity, Persistence, RiskTolerance, AnalyticalBias, CreativeOrientation, SystemicIndex]
    behaviourVector: [{ type: Number, required: true }],

    // 4. Behaviour Profile Summary
    behaviourProfileSummary: {
      speedIndex: { type: String, default: "Balanced" },
      decisionStyle: { type: String, default: "Adaptive" },
      curiosityLevel: { type: String, default: "High" },
      riskProfile: { type: String, default: "Balanced" },
      primaryCognitiveStyle: { type: String, default: "Systemic Innovator" }
    },

    // 5. Mission Status
    completed: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("CognitiveBehaviour", cognitiveBehaviourSchema);
