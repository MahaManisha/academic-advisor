// server/src/modules/career/learningBehaviour.service.js
import LearningBehaviour from "./learningBehaviour.model.js";
import User from "../user/user.model.js";
import { evaluateFuzzyLogicEngine } from "./fuzzyLogic.engine.js";
import { updateProgress } from "../gamification/gamification.service.js";

/**
 * Validate Mission 3 Learning Behaviour Inputs
 */
export const validateLearningBehaviourData = (inputs) => {
  const errors = [];

  if (inputs.studyHours === undefined || isNaN(inputs.studyHours) || inputs.studyHours < 0) {
    errors.push("Study Hours must be a positive number.");
  }

  if (inputs.codingFrequency === undefined || isNaN(inputs.codingFrequency) || inputs.codingFrequency < 0 || inputs.codingFrequency > 4) {
    errors.push("Coding Frequency must be between 0 (Never) and 4 (Daily).");
  }

  if (!inputs.projectInterest || !["Low", "Medium", "High"].includes(inputs.projectInterest)) {
    errors.push("Project Interest must be Low, Medium, or High.");
  }

  if (!inputs.confidenceLevel || isNaN(inputs.confidenceLevel) || inputs.confidenceLevel < 1 || inputs.confidenceLevel > 10) {
    errors.push("Confidence Level must be between 1 and 10.");
  }

  if (!inputs.mathConfidence || isNaN(inputs.mathConfidence) || inputs.mathConfidence < 1 || inputs.mathConfidence > 10) {
    errors.push("Math Confidence must be between 1 and 10.");
  }

  if (!inputs.learningMethod || !["Visual", "Hands-on", "Theoretical", "Mixed"].includes(inputs.learningMethod)) {
    errors.push("Learning Method must be Visual, Hands-on, Theoretical, or Mixed.");
  }

  if (inputs.handsOnVsTheory === undefined || isNaN(inputs.handsOnVsTheory) || inputs.handsOnVsTheory < 0 || inputs.handsOnVsTheory > 100) {
    errors.push("Hands-on vs Theory ratio must be between 0 and 100.");
  }

  if (inputs.individualVsTeam === undefined || isNaN(inputs.individualVsTeam) || inputs.individualVsTeam < 0 || inputs.individualVsTeam > 100) {
    errors.push("Individual vs Team ratio must be between 0 and 100.");
  }

  if (!inputs.preferredStudyTime || !["Early Morning", "Afternoon", "Evening", "Late Night"].includes(inputs.preferredStudyTime)) {
    errors.push("Preferred Study Time is required.");
  }

  return errors;
};

/**
 * Save or Update Learning Behaviour Profile for Mission 3 & Award XP
 */
export const saveLearningBehaviour = async (userId, rawInputs) => {
  const errors = validateLearningBehaviourData(rawInputs);
  if (errors.length > 0) {
    const err = new Error(errors.join(" "));
    err.statusCode = 400;
    throw err;
  }

  const normalizedInputs = {
    studyHours: Number(rawInputs.studyHours),
    codingFrequency: Number(rawInputs.codingFrequency),
    projectInterest: rawInputs.projectInterest,
    confidenceLevel: Number(rawInputs.confidenceLevel),
    mathConfidence: Number(rawInputs.mathConfidence),
    learningMethod: rawInputs.learningMethod,
    handsOnVsTheory: Number(rawInputs.handsOnVsTheory),
    individualVsTeam: Number(rawInputs.individualVsTeam),
    preferredStudyTime: rawInputs.preferredStudyTime
  };

  // Evaluate Fuzzy Logic Engine
  const fuzzyOutputs = evaluateFuzzyLogicEngine(normalizedInputs);

  // Store in MongoDB (save raw inputs + fuzzy outputs)
  const profile = await LearningBehaviour.findOneAndUpdate(
    { userId },
    {
      userId,
      inputs: normalizedInputs,
      fuzzyOutputs,
      completed: true,
      completedAt: new Date()
    },
    { new: true, upsert: true }
  );

  // Sync learning method to User model
  await User.findByIdAndUpdate(userId, {
    learningMode: normalizedInputs.learningMethod.toLowerCase(),
    weeklyHours: normalizedInputs.studyHours
  });

  // Award XP for Mission 3 completion (+250 XP)
  let xpResult = null;
  try {
    xpResult = await updateProgress(userId, "MISSION_3_COMPLETE", 250);
  } catch (e) {
    console.error("Failed to award Mission 3 XP:", e.message);
  }

  return {
    profile,
    fuzzyOutputs,
    xpAwarded: 250,
    xpResult
  };
};

/**
 * Fetch existing Mission 3 Profile
 */
export const getLearningBehaviourByUserId = async (userId) => {
  const profile = await LearningBehaviour.findOne({ userId });
  return profile;
};
