export const XP_RULES = {
  ASSESSMENT_COMPLETE: 50,
  STUDY_PLAN_COMPLETE: 30,
  DAILY_LOGIN: 10,
  CHAT_SESSION: 5
};

export const calculateLevel = (xp) => {
  return Math.floor(xp / 200) + 1;
};

export const unlockBadges = (xp, streak) => {
  const badges = [];

  if (xp >= 500) badges.push("Consistent Learner");
  if (streak >= 7) badges.push("7-Day Streak");
  if (xp >= 1000) badges.push("Academic Warrior");

  return badges;
};
