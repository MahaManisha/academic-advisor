// server/src/modules/career/careerInterest.service.js
import CareerInterest from "./careerInterest.model.js";
import User from "../user/user.model.js";
import { updateProgress } from "../gamification/gamification.service.js";

// Standard Random Index (RI) table for AHP matrix sizes n = 1 to 10
const RANDOM_INDEX_TABLE = {
  1: 0.00,
  2: 0.00,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49
};

/**
 * Perform Analytic Hierarchy Process (AHP) Matrix Math
 * Purely deterministic mathematical matrix solver - NO AI / LLMs used.
 */
export const solveAHPMatrix = (selectedDomains, comparisons) => {
  const n = selectedDomains.length;
  if (n < 2) {
    throw new Error("At least 2 domains are required for AHP evaluation.");
  }

  // 1. Initialize N x N Pairwise Comparison Matrix A with 1s on main diagonal
  const matrix = Array.from({ length: n }, () => Array(n).fill(1.0));

  // Map domain name to index
  const domainIndexMap = {};
  selectedDomains.forEach((domain, idx) => {
    domainIndexMap[domain] = idx;
  });

  // Populate matrix A from pairwise comparisons
  comparisons.forEach(comp => {
    const { domainA, domainB, ratio } = comp;
    const idxA = domainIndexMap[domainA];
    const idxB = domainIndexMap[domainB];

    if (idxA !== undefined && idxB !== undefined && idxA !== idxB) {
      const val = Number(ratio);
      if (!isNaN(val) && val > 0) {
        matrix[idxA][idxB] = val;
        matrix[idxB][idxA] = 1.0 / val;
      }
    }
  });

  // 2. Compute Column Sums
  const columnSums = Array(n).fill(0.0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      columnSums[j] += matrix[i][j];
    }
  }

  // 3. Compute Column-Normalized Matrix B and Row Average (Priority Vector w)
  const normalizedMatrix = Array.from({ length: n }, () => Array(n).fill(0.0));
  const priorityVector = Array(n).fill(0.0);

  for (let i = 0; i < n; i++) {
    let rowSum = 0.0;
    for (let j = 0; j < n; j++) {
      normalizedMatrix[i][j] = matrix[i][j] / columnSums[j];
      rowSum += normalizedMatrix[i][j];
    }
    priorityVector[i] = rowSum / n;
  }

  // 4. Compute Weighted Sum Vector (y = A * w)
  const weightedSumVector = Array(n).fill(0.0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      weightedSumVector[i] += matrix[i][j] * priorityVector[j];
    }
  }

  // 5. Compute Lambda Max (λ_max)
  let lambdaSum = 0.0;
  for (let i = 0; i < n; i++) {
    lambdaSum += weightedSumVector[i] / priorityVector[i];
  }
  const lambdaMax = lambdaSum / n;

  // 6. Compute Consistency Index (CI) and Consistency Ratio (CR)
  const consistencyIndex = n > 1 ? (lambdaMax - n) / (n - 1) : 0.0;
  const randomIndex = RANDOM_INDEX_TABLE[n] || 1.49;
  const consistencyRatio = randomIndex > 0 ? consistencyIndex / randomIndex : 0.0;

  // Standard AHP threshold: CR <= 0.10 indicates reasonable consistency
  const isConsistent = consistencyRatio <= 0.10;

  // 7. Format Interest Weights Map & Sorted Domain Affinity Breakdown
  const interestWeights = {};
  const domainAffinity = selectedDomains.map((domain, i) => {
    const weight = Number(priorityVector[i].toFixed(4));
    interestWeights[domain] = weight;
    return {
      domain,
      weight,
      scorePercentage: Number((weight * 100).toFixed(1)),
      rank: 0
    };
  });

  // Sort descending by weight to assign ranks
  domainAffinity.sort((a, b) => b.weight - a.weight);
  domainAffinity.forEach((item, index) => {
    item.rank = index + 1;
  });

  return {
    matrix,
    priorityVector: priorityVector.map(v => Number(v.toFixed(4))),
    interestWeights,
    domainAffinity,
    lambdaMax: Number(lambdaMax.toFixed(4)),
    consistencyIndex: Number(consistencyIndex.toFixed(4)),
    consistencyRatio: Number(consistencyRatio.toFixed(4)),
    isConsistent
  };
};

/**
 * Save or Update Career Interest Profile for Mission 2 & Award XP
 */
export const saveCareerInterest = async (userId, rawData) => {
  const { selectedDomains, pairwiseComparisons } = rawData;

  if (!Array.isArray(selectedDomains) || selectedDomains.length < 2) {
    const err = new Error("Select at least 2 career domains to perform AHP pairwise evaluation.");
    err.statusCode = 400;
    throw err;
  }

  if (!Array.isArray(pairwiseComparisons) || pairwiseComparisons.length === 0) {
    const err = new Error("Pairwise comparison data is required.");
    err.statusCode = 400;
    throw err;
  }

  // Solve AHP Math
  const ahpResult = solveAHPMatrix(selectedDomains, pairwiseComparisons);

  // Store in MongoDB
  const profile = await CareerInterest.findOneAndUpdate(
    { userId },
    {
      userId,
      selectedDomains,
      pairwiseComparisons,
      pairwiseMatrix: ahpResult.matrix,
      priorityVector: ahpResult.priorityVector,
      interestWeights: ahpResult.interestWeights,
      domainAffinity: ahpResult.domainAffinity,
      lambdaMax: ahpResult.lambdaMax,
      consistencyIndex: ahpResult.consistencyIndex,
      consistencyRatio: ahpResult.consistencyRatio,
      isConsistent: ahpResult.isConsistent,
      completed: true,
      completedAt: new Date()
    },
    { new: true, upsert: true }
  );

  // Sync top ranked domains into User model
  const topDomains = ahpResult.domainAffinity.slice(0, 3).map(d => d.domain);
  await User.findByIdAndUpdate(userId, {
    areaOfInterest: topDomains,
    careerInterest: topDomains[0]
  });

  // Award XP for Mission 2 completion (+250 XP)
  let xpResult = null;
  try {
    xpResult = await updateProgress(userId, "MISSION_2_COMPLETE", 250);
  } catch (e) {
    console.error("Failed to award Mission 2 XP:", e.message);
  }

  return {
    profile,
    ahpResult,
    xpAwarded: 250,
    xpResult
  };
};

/**
 * Fetch existing Mission 2 Profile
 */
export const getCareerInterestByUserId = async (userId) => {
  const profile = await CareerInterest.findOne({ userId });
  return profile;
};
