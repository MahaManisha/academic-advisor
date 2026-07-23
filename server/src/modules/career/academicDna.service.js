// server/src/modules/career/academicDna.service.js
import crypto from "crypto";
import AcademicDNA from "./academicDna.model.js";
import AcademicProfile from "./academicProfile.model.js";
import CareerInterest from "./careerInterest.model.js";
import LearningBehaviour from "./learningBehaviour.model.js";
import CognitiveBehaviour from "./cognitiveBehaviour.model.js";
import CareerCompatibility from "./careerCompatibility.model.js";
import User from "../user/user.model.js";
import { updateProgress } from "../gamification/gamification.service.js";


/**
 * Generate Cryptographic Academic DNA ID & SHA-256 Vector Hash
 */
export const generateDnaIdentifiers = (userIdStr) => {
  const hash = crypto.createHash("sha256").update(userIdStr + Date.now().toString()).digest("hex");
  const sub1 = hash.substring(0, 4).toUpperCase();
  const sub2 = hash.substring(4, 8).toUpperCase();
  const sub3 = hash.substring(8, 12).toUpperCase();

  const academicDnaId = `DNA-${sub1}-${sub2}-${sub3}`;
  return { academicDnaId, dnaSequenceHash: hash };
};

/**
 * Synthesize Permanent Academic DNA Profile from 5 Discovery Missions
 * Purely deterministic algorithm - NO AI / LLM models used.
 */
export const generateAcademicDna = async (userId) => {
  const userIdStr = userId.toString();

  // Fetch data from all 5 previous missions
  const academicDoc = await AcademicProfile.findOne({ userId });
  const interestDoc = await CareerInterest.findOne({ userId });
  const fuzzyDoc = await LearningBehaviour.findOne({ userId });
  const behaviourDoc = await CognitiveBehaviour.findOne({ userId });
  const compatibilityDoc = await CareerCompatibility.findOne({ userId });

  // Generate cryptographic identifiers
  const { academicDnaId, dnaSequenceHash } = generateDnaIdentifiers(userIdStr);

  // 1. Learning Profile
  const learningProfile = {
    method: fuzzyDoc?.inputs?.learningMethod || "Hands-on",
    commitmentScore: fuzzyDoc?.fuzzyOutputs?.learningCommitment || 75,
    consistencyScore: fuzzyDoc?.fuzzyOutputs?.studyConsistency || 70
  };

  // 2. Career Affinity & Compatibility Scores
  const matrix = compatibilityDoc?.compatibilityMatrix || [];
  const primaryDomain = matrix[0]?.domain || interestDoc?.topDomain || "Artificial Intelligence";
  const secondaryDomain = matrix[1]?.domain || "Data Science";

  const compatibilityScores = new Map();
  matrix.forEach(item => {
    compatibilityScores.set(item.domain, item.scorePercentage);
  });

  // 3. Programming Readiness
  const programmingReadiness = fuzzyDoc?.fuzzyOutputs?.programmingReadiness || 80;

  // 4. Behaviour Profile Summary
  const behaviourProfile = {
    archetype: behaviourDoc?.behaviourProfileSummary?.primaryCognitiveStyle || "Systemic Architect",
    speedIndex: behaviourDoc?.behaviourProfileSummary?.speedIndex || "Balanced",
    decisionStyle: behaviourDoc?.behaviourProfileSummary?.decisionStyle || "Methodical",
    riskProfile: behaviourDoc?.behaviourProfileSummary?.riskProfile || "Balanced"
  };

  // 5. Interest Distribution
  const interestDistribution = new Map();
  if (interestDoc?.interestWeights) {
    const weights = interestDoc.interestWeights;
    const entries = weights instanceof Map ? Array.from(weights.entries()) : Object.entries(weights);
    entries.forEach(([k, v]) => interestDistribution.set(k, Number(v)));
  }

  // 6. Identify Top Strengths & Growth Areas
  const strengthDistribution = [];
  if (fuzzyDoc?.fuzzyOutputs?.analyticalReadiness > 70) strengthDistribution.push("High Analytical Reasoning");
  if (fuzzyDoc?.fuzzyOutputs?.programmingReadiness > 70) strengthDistribution.push("Practical Coding Proficiency");
  if (behaviourDoc?.behaviourProfileSummary?.decisionStyle?.includes("Methodical")) strengthDistribution.push("Methodical Decision Discipline");
  if (academicDoc?.knownLanguages?.length > 2) strengthDistribution.push("Polyglot Tech Stack Familiarity");
  if (strengthDistribution.length < 3) strengthDistribution.push("Systemic Problem Architecture");

  const weaknessDistribution = [];
  if (fuzzyDoc?.fuzzyOutputs?.studyConsistency < 60) weaknessDistribution.push("Study Routine Consistency");
  else weaknessDistribution.push("Theory-Practice Balance");

  if (academicDoc?.backlogs > 0) weaknessDistribution.push("Academic Backlog Clearance");
  else weaknessDistribution.push("High-Scale Cloud Infrastructure");

  // Save Academic DNA Document in MongoDB
  const dnaProfile = await AcademicDNA.findOneAndUpdate(
    { userId },
    {
      userId,
      academicDnaId,
      dnaSequenceHash,
      learningProfile,
      careerAffinity: {
        primaryDomain,
        secondaryDomain,
        compatibilityScores
      },
      programmingReadiness,
      behaviourProfile,
      interestDistribution,
      strengthDistribution,
      weaknessDistribution,
      completed: true,
      completedAt: new Date()
    },
    { new: true, upsert: true }
  );

  // Update User document to finalize onboarding & career discovery
  await User.findByIdAndUpdate(userId, {
    careerDiscoveryCompleted: true,
    onboardingCompleted: true,
    academicDnaId,
    archetype: behaviourProfile.archetype,
    careerInterest: primaryDomain
  });

  // Award CAREER_DISCOVERY_COMPLETE achievement badge & +500 XP bonus!
  let xpResult = null;
  try {
    xpResult = await updateProgress(userId, "CAREER_DISCOVERY_COMPLETE", 500);
  } catch (e) {
    console.error("Failed to award Mission 6 completion achievement:", e.message);
  }


  return {
    dnaProfile,
    academicDnaId,
    primaryDomain,
    secondaryDomain,
    programmingReadiness,
    xpAwarded: 500,
    xpResult
  };
};


/**
 * Fetch existing Academic DNA Profile
 */
export const getAcademicDnaByUserId = async (userId) => {
  const profile = await AcademicDNA.findOne({ userId });
  return profile;
};
