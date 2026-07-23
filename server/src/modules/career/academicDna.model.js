// server/src/modules/career/academicDna.model.js
import mongoose from "mongoose";

const academicDnaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    // Unique Cryptographic Academic DNA Identifiers
    academicDnaId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    dnaSequenceHash: {
      type: String,
      required: true
    },

    // 1. Learning Profile
    learningProfile: {
      method: { type: String, default: "Hands-on" },
      commitmentScore: { type: Number, default: 75 },
      consistencyScore: { type: Number, default: 75 }
    },

    // 2. Career Affinity & Compatibility Scores
    careerAffinity: {
      primaryDomain: { type: String, required: true },
      secondaryDomain: { type: String, default: "Data Science" },
      compatibilityScores: {
        type: Map,
        of: Number
      }
    },

    // 3. Programming Readiness Score (0 to 100)
    programmingReadiness: {
      type: Number,
      required: true,
      default: 75
    },

    // 4. Behaviour Profile Summary
    behaviourProfile: {
      archetype: { type: String, default: "Systemic Architect" },
      speedIndex: { type: String, default: "Balanced" },
      decisionStyle: { type: String, default: "Methodical" },
      riskProfile: { type: String, default: "Balanced" }
    },

    // 5. Interest Distribution Weights
    interestDistribution: {
      type: Map,
      of: Number
    },

    // 6. Identified Strengths & Weaknesses
    strengthDistribution: [{ type: String }],
    weaknessDistribution: [{ type: String }],

    // Mission Completion Metadata
    completed: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("AcademicDNA", academicDnaSchema);
