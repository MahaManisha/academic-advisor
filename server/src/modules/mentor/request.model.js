import mongoose from "mongoose";

const mentorRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },
    message: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("MentorRequest", mentorRequestSchema);
