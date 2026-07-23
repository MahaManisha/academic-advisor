// server/src/modules/career/learningBehaviour.controller.js
import {
  saveLearningBehaviour,
  getLearningBehaviourByUserId
} from "./learningBehaviour.service.js";

/**
 * POST /api/career/mission-3
 * Save/Update Learning Behaviour Profile (Mission 3 Fuzzy Logic)
 */
export const submitLearningBehaviour = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const payload = req.body;

    const result = await saveLearningBehaviour(userId, payload);

    res.status(200).json({
      success: true,
      message: "Mission 3: Learning Behaviour Profile evaluated via Fuzzy Logic Engine!",
      data: result.profile,
      fuzzyOutputs: result.fuzzyOutputs,
      xpAwarded: result.xpAwarded,
      xpResult: result.xpResult
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * GET /api/career/mission-3
 * Fetch existing Mission 3 Profile data
 */
export const getLearningBehaviour = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await getLearningBehaviourByUserId(userId);

    res.status(200).json({
      success: true,
      data: profile || null
    });
  } catch (error) {
    next(error);
  }
};
