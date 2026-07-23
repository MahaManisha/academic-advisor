// server/src/modules/career/cognitiveBehaviour.controller.js
import {
  saveCognitiveBehaviour,
  getCognitiveBehaviourByUserId
} from "./cognitiveBehaviour.service.js";

/**
 * POST /api/career/mission-4
 * Save/Update Cognitive & Behaviour Discovery (Mission 4)
 */
export const submitCognitiveBehaviour = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const payload = req.body;

    const result = await saveCognitiveBehaviour(userId, payload);

    res.status(200).json({
      success: true,
      message: "Mission 4: Cognitive & Behaviour Discovery completed successfully!",
      data: result.profile,
      behaviourVector: result.vector,
      summary: result.summary,
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
 * GET /api/career/mission-4
 * Fetch existing Mission 4 profile data
 */
export const getCognitiveBehaviour = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await getCognitiveBehaviourByUserId(userId);

    res.status(200).json({
      success: true,
      data: profile || null
    });
  } catch (error) {
    next(error);
  }
};
