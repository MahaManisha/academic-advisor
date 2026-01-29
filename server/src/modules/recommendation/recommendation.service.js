// server/src/modules/recommendation/recommendation.service.js
import StudentProfile from "../studentProfile/studentProfile.model.js";
import Recommendation from "./recommendation.model.js";
import { cosineSimilarity, normalizeSkills } from "./similarity.utils.js";
import User from "../user/user.model.js";

export const generateRecommendations = async (userId) => {
  const profile = await StudentProfile.findOne({ userId });

  if (!profile) return [];

  const userVector = normalizeSkills(profile.skills);

  // ---- PEER RECOMMENDATION (Collaborative) ----
  const otherProfiles = await StudentProfile.find({
    userId: { $ne: userId }
  }).populate("userId");

  for (const peer of otherProfiles) {
    const peerVector = normalizeSkills(peer.skills);
    const similarity = cosineSimilarity(userVector, peerVector);

    if (similarity > 0.8) {
      await Recommendation.create({
        userId,
        type: "peer",
        referenceId: peer.userId._id,
        domain: peer.skills[0]?.domain,
        confidenceScore: similarity,
        reason: "Similar learning pattern and skill level"
      });
    }
  }

  // ---- COURSE RECOMMENDATION (Content-Based) ----
  for (const skill of profile.skills) {
    if (skill.level !== "advanced") {
      await Recommendation.create({
        userId,
        type: "course",
        domain: skill.domain,
        confidenceScore: 0.75,
        reason: `Improve ${skill.domain} from ${skill.level} level`
      });
    }
  }

  return true;
};
