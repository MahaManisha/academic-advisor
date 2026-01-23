import mongoose from "mongoose";

const assessmentAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    domain: String,
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedAnswer: String,
        isCorrect: Boolean
      }
    ],
    score: Number,
    accuracy: Number,
    inferredLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"]
    },
    completedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model(
  "AssessmentAttempt",
  assessmentAttemptSchema
);
