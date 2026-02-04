// server/src/modules/user/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    emailVerified: {
      type: Boolean,
      default: false
    },

    profileCompleted: {
      type: Boolean,
      default: false
    },

    analyticsGenerated: {
      type: Boolean,
      default: false
    },

    role: {
      type: String,
      enum: ["student", "admin", "trainer"],
      default: "student"
    },

    course: {
      type: String, // e.g., "Computer Science"
      trim: true
    },

    year: {
      type: String, // e.g., "First Year"
      trim: true
    },

    onboardingCompleted: {
      type: Boolean,
      default: false
    },

    pendingAssessments: {
      type: Number,
      default: 1
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active"
    },

    // Onboarding Profile
    focus: { type: String }, // e.g., 'academic', 'career', 'research'
    learningMode: { type: String }, // e.g., 'visual', 'hands-on'
    experienceLevel: { type: Number }, // 0-100
    knowledgeScore: { type: Number }, // Derived from experience or assessment
    weeklyHours: { type: Number },
    archetype: { type: String },
    domain: { type: String },

    // Dashboard Stats
    completedAssessments: { type: Number, default: 0 },
    studyHoursWeek: { type: Number, default: 0 },
    studyStreak: { type: Number, default: 0 },
    upcomingDeadlines: { type: Number, default: 0 },

    // Assessment Results (Simplified storage)
    assessmentResults: { type: Object }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
