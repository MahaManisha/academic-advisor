import Analytics from "../analytics/analytics.model.js";

export const suggestPeers = async (userId, skill) => {
  const peers = await Analytics.find({
    strongAreas: skill
  })
    .sort({ averageScore: -1 })
    .limit(5)
    .populate("userId", "name email");

  return peers.filter(
    p => p.userId._id.toString() !== userId
  );
};
