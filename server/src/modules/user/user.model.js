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
      default: "student",
      index: true
    },

    // Academic Identity
    academicStatus: {
      type: String,
      enum: ["school", "college", "graduated"],
      index: true
    },

    // 1. School Student Fields
    schoolName: { type: String, trim: true },
    educationBoard: { type: String, enum: ["State Board", "CBSE", "ICSE", "Other"] },
    standard: { type: String, enum: ["6th", "7th", "8th", "9th", "10th", "11th", "12th"] },
    medium: { type: String, default: "English" },

    // 2. College Student Fields
    college: { type: String, trim: true },
    syllabusUrl: { type: String, trim: true }, // For auto-generating assessments
    degreeType: { type: String },
    domain: { type: String, trim: true }, // Course/Major
    department: { type: String, trim: true },
    year: { type: Number, min: 1, max: 5 },
    areaOfInterest: [{ type: String }], // Multi-select

    // 3. Graduated User Fields
    qualification: { type: String }, // Highest Qualification
    fieldOfStudy: { type: String },
    skills: [{ type: String }], // Multi-select
    careerInterest: { type: String }, // Goal

    // Backward compatibility aliases
    course: { type: String },
    learningDomain: { type: String },

    onboardingCompleted: {
      type: Boolean,
      default: false
    },

    accessibilityPreferences: {
      visualMode: { type: String, default: "normal" },
      motionMode: { type: String, default: "normal" },
      inputMode: { type: String, default: "keyboard" },
      cognitiveMode: { type: String, default: "standard" },
      audioSupport: { type: Boolean, default: false },
      screenReaderOptimized: { type: Boolean, default: false },
      // New UI toggles from accessibility panel
      largeTextMode: { type: Boolean, default: false },
      dyslexiaFont: { type: Boolean, default: false },
      darkMode: { type: Boolean, default: false },
      keyboardNavigation: { type: Boolean, default: false },
      voiceInteraction: { type: Boolean, default: false },
      simplifiedInterface: { type: Boolean, default: false },
      lowCognitiveLoad: { type: Boolean, default: false },
      // Legacy fields to not break existing schema
      highContrastMode: { type: Boolean, default: false },
      reducedMotion: { type: Boolean, default: false },
      voiceMode: { type: Boolean, default: false },
      gameMode: { type: Boolean, default: true }
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

    notificationSettings: {
      deadline: { type: Boolean, default: true },
      friendRequest: { type: Boolean, default: true },
      message: { type: Boolean, default: true }
    },

    // Onboarding Profile
    focus: { type: String }, // e.g., 'academic', 'career', 'research'
    learningMode: { type: String }, // e.g., 'visual', 'hands-on'
    experienceLevel: { type: Number }, // 0-100
    knowledgeScore: { type: Number }, // Derived from experience or assessment
    weeklyHours: { type: Number },
    archetype: { type: String },

    // Dashboard Stats
    completedAssessments: { type: Number, default: 0 },
    studyHoursWeek: { type: Number, default: 0 },
    studyStreak: { type: Number, default: 0 },
    upcomingDeadlines: { type: Number, default: 0 },

    // Assessment Results (Simplified storage)
    assessmentResults: { type: Object },

    // Peer Connections
    connections: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        status: {
          type: String,
          enum: ["pending", "connected"],
          default: "pending"
        },
        requestedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
