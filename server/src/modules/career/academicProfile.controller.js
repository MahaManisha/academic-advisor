// server/src/modules/career/academicProfile.controller.js
import {
  saveAcademicFoundation,
  getAcademicFoundationByUserId
} from "./academicProfile.service.js";

/**
 * POST /api/career/mission-1
 * Save/Update Academic Foundation (Mission 1)
 */
export const submitAcademicFoundation = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let payload = req.body;

    // Handle stringified JSON if form-data was sent
    if (typeof payload.data === "string") {
      try {
        payload = JSON.parse(payload.data);
      } catch (e) {
        // preserve payload as is
      }
    }

    const pdfFile = req.files?.syllabusPdf || req.file || null;

    const result = await saveAcademicFoundation(userId, payload, pdfFile);

    res.status(200).json({
      success: true,
      message: "Mission 1: Academic Foundation completed successfully!",
      data: result.profile,
      vector: result.vector,
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
 * GET /api/career/mission-1
 * Fetch existing Academic Foundation data
 */
export const getAcademicFoundation = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await getAcademicFoundationByUserId(userId);

    res.status(200).json({
      success: true,
      data: profile || null
    });
  } catch (error) {
    next(error);
  }
};
