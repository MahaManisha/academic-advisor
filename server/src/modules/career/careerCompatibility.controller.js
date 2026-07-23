// server/src/modules/career/careerCompatibility.controller.js
import {
  saveCareerCompatibility,
  getCareerCompatibilityByUserId
} from "./careerCompatibility.service.js";

/**
 * POST /api/career/mission-5
 * Execute & Save Multi-Vector Career Compatibility Analysis (Mission 5)
 */
export const submitCareerCompatibility = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const result = await saveCareerCompatibility(userId);

    res.status(200).json({
      success: true,
      message: "Mission 5: Career Compatibility Analysis computed successfully via Multi-Vector Engine!",
      data: result.profile,
      compatibilityMatrix: result.compatibilityMatrix,
      topDomain: result.topDomain,
      overallReadiness: result.overallReadiness,
      xpAwarded: result.xpAwarded,
      xpResult: result.xpResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career/mission-5
 * Fetch existing Mission 5 profile data
 */
export const getCareerCompatibility = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await getCareerCompatibilityByUserId(userId);

    res.status(200).json({
      success: true,
      data: profile || null
    });
  } catch (error) {
    next(error);
  }
};
