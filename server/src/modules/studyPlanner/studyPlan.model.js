// server/src/modules/studyPlanner/studyPlan.model.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: String,
  domain: String,
  estimatedMinutes: Number,
  status: {
    type: String,
    enum: ["pending", "completed", "missed"],
    default: "pending"
  },
  dueDate: Date
});

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    period: {
      type: String,
      enum: ["daily", "weekly"]
    },

    tasks: [taskSchema],

    generatedBy: {
      type: String,
      default: "rule-engine" // later: LLM
    },

    performanceScore: Number, // used for adaptation

    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("StudyPlan", studyPlanSchema);
