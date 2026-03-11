// server/src/modules/gamification/gamification.controller.js
import { updateProgress } from "./gamification.service.js";
import Gamification from "./gamification.model.js";

export const reward = async (req, res, next) => {
  try {
    const { action, customXP } = req.body;
    const data = await updateProgress(req.user.id, action, customXP);
    // Explicit return required by step 6: newXP, level, unlockedBadges[], streak
    res.json({
      success: true,
      newXP: data.newXP,
      level: data.level,
      unlockedBadges: data.unlockedBadges,
      streak: data.streak,
      levelUp: data.levelUp // added extra context
    });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    let data = await Gamification.findOne({
      userId: req.user.id
    });

    if (!data) {
      data = { xp: 0, level: 1, streak: 0, badges: [] }
    }

    // progressToNextLevel = (xp % 200) / 200 * 100
    const progressToNextLevel = ((data.xp % 200) / 200) * 100;

    res.json({
      success: true,
      xp: data.xp,
      level: data.level,
      streak: data.streak,
      badges: data.badges,
      progressToNextLevel
    });
  } catch (err) {
    next(err);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    // Fetch top 50 users sorted by XP descending
    const topUsers = await Gamification.find({})
      .sort({ xp: -1 })
      .limit(50)
      .populate("userId", "fullName email role academicStatus bg theme archetype");

    // Filter out potential null users if they were deleted and map data
    const leaderboard = topUsers
      .filter((entry) => entry.userId)
      .map((entry, index) => ({
        rank: index + 1,
        id: entry.userId._id,
        name: entry.userId.fullName,
        role: entry.userId.role,
        academicStatus: entry.userId.academicStatus,
        archetype: entry.userId.archetype,
        xp: entry.xp,
        level: entry.level,
        badges: entry.badges,
        streak: entry.streak
      }));

    res.json({
      success: true,
      leaderboard
    });
  } catch (err) {
    next(err);
  }
};
