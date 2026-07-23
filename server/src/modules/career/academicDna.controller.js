// server/src/modules/career/academicDna.controller.js
import {
  generateAcademicDna,
  getAcademicDnaByUserId
} from "./academicDna.service.js";

/**
 * POST /api/career/mission-6
 * Generate & Save Permanent Academic DNA Profile (Mission 6)
 */
export const submitAcademicDna = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const result = await generateAcademicDna(userId);

    res.status(200).json({
      success: true,
      message: "Mission 6: Permanent Academic DNA generated successfully!",
      data: result.dnaProfile,
      academicDnaId: result.academicDnaId,
      primaryDomain: result.primaryDomain,
      secondaryDomain: result.secondaryDomain,
      programmingReadiness: result.programmingReadiness,
      xpAwarded: result.xpAwarded,
      xpResult: result.xpResult,
      achievementResult: result.achievementResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career/mission-6
 * Fetch existing Academic DNA Profile
 */
export const getAcademicDna = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await getAcademicDnaByUserId(userId);

    res.status(200).json({
      success: true,
      data: profile || null
    });
  } catch (error) {
    next(error);
  }
};
