// server/src/modules/gamification/gamification.service.js
import Gamification from "./gamification.model.js";
import {
  XP_RULES,
  calculateLevel,
  unlockBadges
} from "./gamification.rules.js";

export const updateProgress = async (userId, action, customXP = 0) => {
  let data = await Gamification.findOne({ userId });

  if (!data) {
    data = await Gamification.create({ userId });
  }

  const oldLevel = data.level;
  const oldBadgesLength = data.badges.length;

  // Logic for daily streak would go here based on dates, simplified for now
  const xpGained = customXP > 0 ? customXP : (XP_RULES[action] || 0);
  data.xp += xpGained;
  data.level = calculateLevel(data.xp);
  data.lastActive = new Date();

  const newBadgesList = unlockBadges(data.xp, data.streak);
  const previouslyUnlocked = new Set(data.badges);
  const unlockedBadges = newBadgesList.filter(b => !previouslyUnlocked.has(b));

  data.badges = [...new Set([...data.badges, ...newBadgesList])];

  await data.save();
  return {
    newXP: data.xp,
    level: data.level,
    unlockedBadges: unlockedBadges,
    streak: data.streak,
    levelUp: data.level > oldLevel
  };
};
