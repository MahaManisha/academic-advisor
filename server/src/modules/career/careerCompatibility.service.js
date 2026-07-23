// server/src/modules/career/careerCompatibility.service.js
import CareerCompatibility from "./careerCompatibility.model.js";
import AcademicProfile from "./academicProfile.model.js";
import CareerInterest from "./careerInterest.model.js";
import LearningBehaviour from "./learningBehaviour.model.js";
import CognitiveBehaviour from "./cognitiveBehaviour.model.js";
import CareerProfile from "./career.model.js";
import User from "../user/user.model.js";
import { updateProgress } from "../gamification/gamification.service.js";

const ALL_12_DOMAINS = [
  "Artificial Intelligence",
  "Machine Learning",
  "Data Science",
  "Cyber Security",
  "Cloud Computing",
  "DevOps",
  "Full Stack Development",
  "Frontend",
  "Backend",
  "Mobile Development",
  "Game Development",
  "Research"
];

// Target tech stack mapping per domain
const DOMAIN_TECH_MAP = {
  "Artificial Intelligence": ["python", "pytorch", "cuda", "opencv", "c++", "ai"],
  "Machine Learning": ["python", "scikit-learn", "tensorflow", "pandas", "r", "ml"],
  "Data Science": ["python", "r", "sql", "tableau", "pandas", "excel"],
  "Cyber Security": ["linux", "wireshark", "metasploit", "python", "c", "security"],
  "Cloud Computing": ["aws", "azure", "docker", "kubernetes", "linux", "cloud"],
  "DevOps": ["docker", "kubernetes", "terraform", "jenkins", "ansible", "git"],
  "Full Stack Development": ["javascript", "react", "node.js", "express", "mongodb", "html/css"],
  "Frontend": ["javascript", "typescript", "react", "vue", "html/css", "tailwind"],
  "Backend": ["node.js", "python", "java", "postgresql", "sql", "express", "c#"],
  "Mobile Development": ["react native", "flutter", "swift", "kotlin", "javascript"],
  "Game Development": ["c#", "c++", "unity", "unreal", "python"],
  "Research": ["python", "r", "matlab", "latex", "c++"]
};

/**
 * Execute Multi-Vector Synthesis Compatibility Engine
 * Purely deterministic multi-criteria matrix math - NO AI / LLM models used.
 */
export const calculateMultiVectorCompatibility = async (userId) => {
  // Fetch data from previous missions
  const academicDoc = await AcademicProfile.findOne({ userId });
  const interestDoc = await CareerInterest.findOne({ userId });
  const fuzzyDoc = await LearningBehaviour.findOne({ userId });
  const behaviourDoc = await CognitiveBehaviour.findOne({ userId });

  const hasAcademic = !!academicDoc;
  const hasInterest = !!interestDoc;
  const hasFuzzy = !!fuzzyDoc;
  const hasBehaviour = !!behaviourDoc;

  // Extract profiles or fallbacks
  const knownLanguages = (academicDoc?.knownLanguages || []).map(l => l.toLowerCase());
  const academicVector = academicDoc?.academicVector || Array(16).fill(0.5);
  const ahpWeights = interestDoc?.interestWeights || new Map();

  const fuzzyOutputs = fuzzyDoc?.fuzzyOutputs || {
    learningCommitment: 65,
    programmingReadiness: 65,
    studyConsistency: 65,
    learningFlexibility: 65,
    analyticalReadiness: 65
  };

  const behaviourVector = behaviourDoc?.behaviourVector || [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];

  // Synthesize Compatibility Scores for all 12 domains
  const rawResults = ALL_12_DOMAINS.map(domain => {
    // 1. Academic Score (0-100)
    const requiredTech = DOMAIN_TECH_MAP[domain] || [];
    const matchedCount = knownLanguages.filter(lang => requiredTech.includes(lang)).length;
    const techMatchRatio = requiredTech.length > 0 ? matchedCount / Math.min(requiredTech.length, 3) : 0.5;
    const acadBase = (academicVector[0] || 0.5) * 40 + (academicVector[1] || 0.5) * 40 + (techMatchRatio * 20);
    const academicScore = Math.min(100, Math.max(30, Math.round(acadBase)));

    // 2. AHP Interest Score (0-100)
    let ahpScore = 50;
    const ahpWeight = ahpWeights instanceof Map ? ahpWeights.get(domain) : ahpWeights[domain];
    if (ahpWeight !== undefined && !isNaN(ahpWeight)) {
      ahpScore = Math.min(100, Math.max(25, Math.round(Number(ahpWeight) * 280)));
    }

    // 3. Fuzzy Readiness Score (0-100)
    let fuzzyScore = 60;
    if (["Artificial Intelligence", "Machine Learning", "Data Science", "Research"].includes(domain)) {
      fuzzyScore = Math.round(fuzzyOutputs.analyticalReadiness * 0.6 + fuzzyOutputs.learningCommitment * 0.4);
    } else if (["Full Stack Development", "Backend", "Frontend", "Mobile Development"].includes(domain)) {
      fuzzyScore = Math.round(fuzzyOutputs.programmingReadiness * 0.6 + fuzzyOutputs.learningFlexibility * 0.4);
    } else {
      fuzzyScore = Math.round(fuzzyOutputs.studyConsistency * 0.6 + fuzzyOutputs.learningCommitment * 0.4);
    }

    // 4. Behaviour Alignment Score (0-100)
    // Vector: [Speed, Stability, Curiosity, Persistence, RiskTolerance, AnalyticalBias, CreativeOrientation, SystemicIndex]
    let behaviourScore = 65;
    if (["Artificial Intelligence", "Game Development"].includes(domain)) {
      behaviourScore = Math.round(((behaviourVector[4] || 0.5) * 0.5 + (behaviourVector[6] || 0.5) * 0.5) * 100);
    } else if (["Cyber Security", "DevOps", "Cloud Computing"].includes(domain)) {
      behaviourScore = Math.round(((behaviourVector[1] || 0.5) * 0.5 + (behaviourVector[7] || 0.5) * 0.5) * 100);
    } else {
      behaviourScore = Math.round(((behaviourVector[2] || 0.5) * 0.5 + (behaviourVector[5] || 0.5) * 0.5) * 100);
    }
    behaviourScore = Math.min(100, Math.max(30, behaviourScore));

    // Weighted Multi-Vector Compatibility Formula: 30% Acad + 35% AHP + 20% Fuzzy + 15% Beh
    const finalScore = Math.min(99, Math.max(15, Math.round(
      academicScore * 0.30 +
      ahpScore * 0.35 +
      fuzzyScore * 0.20 +
      behaviourScore * 0.15
    )));

    return {
      domain,
      scorePercentage: finalScore,
      rank: 0,
      breakdown: {
        academicScore,
        ahpScore,
        fuzzyScore,
        behaviourScore
      }
    };
  });

  // Sort descending by compatibility score
  rawResults.sort((a, b) => b.scorePercentage - a.scorePercentage);
  rawResults.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  const topDomain = rawResults[0]?.domain || "Artificial Intelligence";
  const overallReadiness = rawResults[0]?.scorePercentage || 85;

  return {
    vectorInputsUsed: {
      hasAcademic,
      hasInterest,
      hasFuzzy,
      hasBehaviour
    },
    compatibilityMatrix: rawResults,
    topDomain,
    overallReadiness
  };
};

/**
 * Save or Update Career Compatibility Profile for Mission 5 & Award XP
 */
export const saveCareerCompatibility = async (userId) => {
  // Execute multi-vector compatibility engine
  const result = await calculateMultiVectorCompatibility(userId);

  // Store in MongoDB
  const profile = await CareerCompatibility.findOneAndUpdate(
    { userId },
    {
      userId,
      vectorInputsUsed: result.vectorInputsUsed,
      compatibilityMatrix: result.compatibilityMatrix,
      topDomain: result.topDomain,
      overallReadiness: result.overallReadiness,
      completed: true,
      completedAt: new Date()
    },
    { new: true, upsert: true }
  );

  // Sync overall readiness into CareerProfile model if exists
  await CareerProfile.findOneAndUpdate(
    { userId },
    { overallReadiness: result.overallReadiness, expertDomain: result.topDomain },
    { upsert: true }
  );

  // Sync user profile
  await User.findByIdAndUpdate(userId, {
    careerInterest: result.topDomain
  });

  // Award XP for Mission 5 completion (+250 XP)
  let xpResult = null;
  try {
    xpResult = await updateProgress(userId, "MISSION_5_COMPLETE", 250);
  } catch (e) {
    console.error("Failed to award Mission 5 XP:", e.message);
  }

  return {
    profile,
    compatibilityMatrix: result.compatibilityMatrix,
    topDomain: result.topDomain,
    overallReadiness: result.overallReadiness,
    xpAwarded: 250,
    xpResult
  };
};

/**
 * Fetch existing Mission 5 Profile
 */
export const getCareerCompatibilityByUserId = async (userId) => {
  const profile = await CareerCompatibility.findOne({ userId });
  return profile;
};
