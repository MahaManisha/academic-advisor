import Gamification from "./gamification.model.js";
import {
  XP_RULES,
  calculateLevel,
  unlockBadges
} from "./gamification.rules.js";

export const updateProgress = async (userId, action) => {
  let data = await Gamification.findOne({ userId });

  if (!data) {
    data = await Gamification.create({ userId });
  }

  data.xp += XP_RULES[action] || 0;
  data.level = calculateLevel(data.xp);
  data.lastActive = new Date();

  const newBadges = unlockBadges(data.xp, data.streak);
  data.badges = [...new Set([...data.badges, ...newBadges])];

  await data.save();
  return data;
};
