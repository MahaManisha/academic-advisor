// server/src/modules/career/academicProfile.model.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    link: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const academicProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    // 1. Academic Institution & Level (Mandatory)
    collegeName: { type: String, required: true, trim: true },
    university: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    currentYear: { type: Number, required: true, min: 1, max: 6 },
    currentSemester: { type: Number, required: true, min: 1, max: 12 },
    expectedGraduation: { type: Number, required: true }, // e.g., 2026

    // 2. Performance (Optional)
    cgpa: { type: Number, min: 0, max: 10, default: null },
    backlogs: { type: Number, min: 0, default: 0 },

    // 3. Technical Background (Mandatory)
    programmingExperience: {
      type: String,
      required: true,
      enum: ["None", "Beginner", "Intermediate", "Advanced"]
    },
    knownLanguages: [{ type: String, trim: true }],
    completedProjects: [projectSchema],

    // 4. Additional Credentials (Optional)
    certifications: [{ type: String, trim: true }],
    syllabusUrl: { type: String, trim: true, default: "" },
    syllabusPdfPath: { type: String, trim: true, default: "" },

    // 5. Deterministic Feature Vector (16-dimensional array for downstream matching)
    academicVector: {
      type: [Number],
      required: true,
      default: []
    },

    // 6. Mission Status
    completed: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("AcademicProfile", academicProfileSchema);
