// server/src/modules/studentProfile/studentProfile.model.js
import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    confidenceScore: { type: Number, default: 0 }
  },
  { _id: false }
);

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    academicLevel: {
      type: String,
      default: "UG"
    },

    interests: [String],

    careerGoals: [String],

    skills: [skillSchema],

    learningSpeed: {
      type: Number,
      default: 0
    },

    consistencyScore: {
      type: Number,
      default: 0
    },

    burnoutRisk: {
      type: Number,
      default: 0
    },

    lastAssessmentAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("StudentProfile", studentProfileSchema);
