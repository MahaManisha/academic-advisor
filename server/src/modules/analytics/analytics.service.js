import Analytics from "./analytics.model.js";
import AssessmentAttempt from "../assessment/assessmentAttempt.model.js";
import StudentProfile from "../studentProfile/studentProfile.model.js";
import { detectWeaknesses, calculateTrend } from "./analytics.utils.js";

export const generateAnalytics = async (userId, domain) => {
  const attempts = await AssessmentAttempt.find({ userId, domain });

  if (!attempts.length) return null;

  const profile = await StudentProfile.findOne({ userId });

  const trend = calculateTrend(attempts);
  const weaknesses = detectWeaknesses(attempts);

  return await Analytics.create({
    userId,
    domain,
    skillLevel: profile.skills.find(s => s.domain === domain)?.level,
    accuracy:
      attempts.reduce((a, b) => a + b.accuracy, 0) /
      attempts.length,
    scoreTrend: trend,
    weaknessAreas: weaknesses,
    comparisonGroupAvg: 65
  });
};
