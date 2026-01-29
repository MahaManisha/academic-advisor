// server/src/modules/assessment/question.model.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true }, // e.g. DSA, ML
    topic: { type: String, required: true },

    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    questionText: { type: String, required: true },

    options: [String],

    correctAnswer: { type: String, required: true },

    explanation: String,

    tags: [String],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

questionSchema.index({ domain: 1, difficulty: 1 });

export default mongoose.model("Question", questionSchema);
