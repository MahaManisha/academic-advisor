import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    domain: {
      type: String,
      required: true
    },
    skills: [
      {
        type: String
      }
    ],
    experience: {
      type: Number,
      required: true
    },
    qualification: {
      type: String
    },
    rating: {
      type: Number,
      default: 0
    },
    onboardingScore: {
      type: Number,
      default: 0
    },
    feedbackScores: [
      {
        type: Number
      }
    ],
    totalSessions: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Mentor", mentorSchema);
