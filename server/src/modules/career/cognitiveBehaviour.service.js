// server/src/modules/career/cognitiveBehaviour.service.js
import CognitiveBehaviour from "./cognitiveBehaviour.model.js";
import User from "../user/user.model.js";
import { updateProgress } from "../gamification/gamification.service.js";

/**
 * Generate 8-Dimensional Behaviour Vector & Summary
 * Purely deterministic algorithm - NO AI / LLM models used.
 */
export const generateBehaviourVector = (telemetry = {}, responses = {}) => {
  const {
    responseTimesMs = [],
    totalDurationMs = 30000,
    choiceChangesCount = 0,
    curiosityClicksCount = 0,
    navigationFlipsCount = 0
  } = telemetry;

  // 1. Speed Score (0.0 = Very Deliberate, 1.0 = Very Fast)
  const avgResponseTimeMs = responseTimesMs.length > 0
    ? responseTimesMs.reduce((a, b) => a + b, 0) / responseTimesMs.length
    : 5000;
  const speedScore = Math.max(0.1, Math.min(1.0, 1.0 - (avgResponseTimeMs / 15000.0)));

  // 2. Decision Stability (1.0 = Highly Decisive, 0.0 = Frequent Revisions)
  const decisionStability = Math.max(0.1, Math.min(1.0, 1.0 - (choiceChangesCount * 0.15)));

  // 3. Curiosity Score (1.0 = Expanded many info cards, 0.0 = Direct path)
  const curiosityScore = Math.min(1.0, Math.max(0.1, curiosityClicksCount / 5.0));

  // 4. Persistence Score (Engagement depth based on duration & review flips)
  const persistenceScore = Math.min(1.0, Math.max(0.2, (totalDurationMs / 60000.0) + (navigationFlipsCount * 0.1)));

  // 5. Risk Tolerance (Derived from Challenge 7)
  let riskTolerance = 0.5;
  const riskChoice = responses.challenge7 || responses.riskReward;
  if (riskChoice === 'highRisk') riskTolerance = 0.95;
  else if (riskChoice === 'balanced') riskTolerance = 0.6;
  else if (riskChoice === 'safe') riskTolerance = 0.25;

  // 6. Analytical Bias (Derived from Logic & Pattern Recognition)
  let analyticalBias = 0.6;
  const logicChoice = responses.challenge4 || responses.logic;
  if (logicChoice === 'systemic' || logicChoice === 'algorithmic') analyticalBias = 0.9;

  // 7. Creative Orientation (Derived from Creativity Task)
  let creativeOrientation = 0.6;
  const creativityChoice = responses.challenge6 || responses.creativity;
  if (creativityChoice === 'innovation' || creativityChoice === 'ui') creativeOrientation = 0.9;

  // 8. Systemic Index (Derived from Resource Allocation distribution)
  let systemicIndex = 0.7;
  const resources = responses.challenge8 || responses.resourceAllocation || { performance: 25, security: 25, ux: 25, innovation: 25 };
  if (typeof resources === 'object') {
    const values = Object.values(resources).map(Number);
    const mean = values.reduce((a, b) => a + b, 0) / (values.length || 1);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length || 1);
    // Lower variance means higher systemic balance
    systemicIndex = Math.max(0.2, Math.min(1.0, 1.0 - (variance / 1000.0)));
  }

  const vector = [
    speedScore,
    decisionStability,
    curiosityScore,
    persistenceScore,
    riskTolerance,
    analyticalBias,
    creativeOrientation,
    systemicIndex
  ].map(v => Number(v.toFixed(4)));

  // Profile Summary Generation
  const speedIndex = speedScore > 0.7 ? "Fast / Decisive" : speedScore > 0.4 ? "Balanced / Thoughtful" : "Deliberate / Analytical";
  const decisionStyle = decisionStability > 0.7 ? "Methodical & Confident" : "Adaptive & Iterative";
  const curiosityLevel = curiosityScore > 0.6 ? "High Curiosity Explorer" : "Goal-Oriented Specialist";
  const riskProfile = riskTolerance > 0.7 ? "High-Impact Innovator" : riskTolerance > 0.4 ? "Balanced Risk Manager" : "Stability & Reliability Focused";

  let primaryCognitiveStyle = "Systemic Architect";
  if (analyticalBias > 0.8 && speedScore < 0.6) primaryCognitiveStyle = "Deep Analytical Strategist";
  else if (creativeOrientation > 0.8) primaryCognitiveStyle = "Creative Product Visionary";
  else if (riskTolerance > 0.8) primaryCognitiveStyle = "Disruptive Technical Pioneer";

  return {
    vector,
    summary: {
      speedIndex,
      decisionStyle,
      curiosityLevel,
      riskProfile,
      primaryCognitiveStyle
    }
  };
};

/**
 * Save or Update Cognitive Behaviour Profile for Mission 4 & Award XP
 */
export const saveCognitiveBehaviour = async (userId, rawData) => {
  const { telemetry = {}, challengeResponses = {} } = rawData;

  // Calculate 8-D Behaviour Vector & Profile Summary
  const { vector, summary } = generateBehaviourVector(telemetry, challengeResponses);

  // Store in MongoDB
  const profile = await CognitiveBehaviour.findOneAndUpdate(
    { userId },
    {
      userId,
      telemetry,
      challengeResponses,
      behaviourVector: vector,
      behaviourProfileSummary: summary,
      completed: true,
      completedAt: new Date()
    },
    { new: true, upsert: true }
  );

  // Sync archetype indicator to User model
  await User.findByIdAndUpdate(userId, {
    archetype: summary.primaryCognitiveStyle
  });

  // Award XP for Mission 4 completion (+250 XP)
  let xpResult = null;
  try {
    xpResult = await updateProgress(userId, "MISSION_4_COMPLETE", 250);
  } catch (e) {
    console.error("Failed to award Mission 4 XP:", e.message);
  }

  return {
    profile,
    vector,
    summary,
    xpAwarded: 250,
    xpResult
  };
};

/**
 * Fetch existing Mission 4 Profile
 */
export const getCognitiveBehaviourByUserId = async (userId) => {
  const profile = await CognitiveBehaviour.findOne({ userId });
  return profile;
};
