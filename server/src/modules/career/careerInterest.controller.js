// server/src/modules/career/careerInterest.controller.js
import {
  saveCareerInterest,
  getCareerInterestByUserId
} from "./careerInterest.service.js";

/**
 * POST /api/career/mission-2
 * Save/Update Career Interest Discovery (Mission 2 AHP)
 */
export const submitCareerInterest = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const payload = req.body;

    const result = await saveCareerInterest(userId, payload);

    res.status(200).json({
      success: true,
      message: "Mission 2: Career Interest Discovery completed successfully via AHP!",
      data: result.profile,
      ahpResult: result.ahpResult,
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
 * GET /api/career/mission-2
 * Fetch existing Mission 2 profile data
 */
export const getCareerInterest = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await getCareerInterestByUserId(userId);

    res.status(200).json({
      success: true,
      data: profile || null
    });
  } catch (error) {
    next(error);
  }
};
