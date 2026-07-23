// server/src/modules/career/careerInterest.model.js
import mongoose from "mongoose";

const domainAffinitySchema = new mongoose.Schema(
  {
    domain: { type: String, required: true },
    weight: { type: Number, required: true },
    scorePercentage: { type: Number, required: true },
    rank: { type: Number, required: true }
  },
  { _id: false }
);

const pairwiseComparisonSchema = new mongoose.Schema(
  {
    domainA: { type: String, required: true },
    domainB: { type: String, required: true },
    ratio: { type: Number, required: true } // 1/9 to 9 scale
  },
  { _id: false }
);

const careerInterestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    // 1. Selected Target Domains (4 to 6 domains)
    selectedDomains: [{ type: String, required: true }],

    // 2. Pairwise Comparison Records
    pairwiseComparisons: [pairwiseComparisonSchema],

    // 3. N x N Comparison Matrix
    pairwiseMatrix: [[Number]],

    // 4. AHP Outputs
    priorityVector: [{ type: Number, required: true }], // Normalized weights summing to 1.0
    interestWeights: { type: Map, of: Number }, // Domain -> Weight mapping
    domainAffinity: [domainAffinitySchema], // Sorted by weight descending

    // 5. AHP Consistency Metrics
    lambdaMax: { type: Number, required: true },
    consistencyIndex: { type: Number, required: true },
    consistencyRatio: { type: Number, required: true }, // CR = CI / RI
    isConsistent: { type: Boolean, default: true },

    // 6. Mission Completion Status
    completed: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("CareerInterest", careerInterestSchema);
