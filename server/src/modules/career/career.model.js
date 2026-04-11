// server/src/modules/career/career.model.js
import mongoose from 'mongoose';

const CareerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  targetRoles: [{
    role: { type: String, required: true },
    matchScore: { type: Number, default: 0 },  // 0-100
    description: { type: String, default: '' },
    skillGaps: [String],
    requiredSkills: [String],
    roadmap: [String],
    avgSalary: { type: String, default: '' },
    difficulty: { type: String, default: 'Medium' } // Easy / Medium / Hard
  }],
  currentSkills: [String],
  expertDomain: { type: String, default: '' },
  overallReadiness: { type: Number, default: 0 }, // 0-100
  lastPredictedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('CareerProfile', CareerProfileSchema);
