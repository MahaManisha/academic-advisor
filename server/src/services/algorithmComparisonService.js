const UserAnalytics = require('../models/UserAnalytics');
const ExperimentResult = require('../models/ExperimentResult');
const { generateFinalAnalytics } = require('./analyticsEngine');
const { generateHybridRecommendations, queryVectorDB, computeHybridScore } = require('./hybridRecommendationEngine');
const { generateLLMResponse } = require('../utils/llmHelper'); // Assuming LLM helper exists here

/**
 * ----------------------------------------------------
 * Algorithm Subroutines
 * defined here to cleanly structure the execution flow
 * ----------------------------------------------------
 */

/**
 * V1: Rule-based only
 * Directly maps highest domain score to the rule-based logic from the Analytics Engine.
 */
const runV1RuleBased = (analyticsData) => {
    // Generate tracks strictly using the logic mapped in analyticsEngine base logic
    // analyticsEngine computes recommendedTracks via internal heuristics
    const recommendations = analyticsData.recommendedTracks || ['General IT'];
    return {
        topDomain: recommendations[0],
        alternativeDomains: recommendations.slice(1, 4),
        reasoning: "Generated purely based on static rule-mappings against your highest domain scores.",
        recommendationConfidence: Math.round(analyticsData.confidenceScore || 50)
    };
};

/**
 * V2: Vector similarity only
 * Directly uses Vector DB similarities from the inputs. No heuristic logic.
 */
const runV2VectorSimilarity = async (analyticsData) => {
    const { strengthWeaknessMap, interestVector } = analyticsData;

    // Construct query without heuristics
    const queryText = `
        Interests: ${JSON.stringify(interestVector)}
        Strengths: ${strengthWeaknessMap?.strengths?.map(s => s.domain).join(', ')}
    `.trim();

    const vectorResults = await queryVectorDB(queryText, 5); // From hybrid engine mock

    if (!vectorResults || vectorResults.length === 0) {
        return {
            topDomain: "Unknown",
            alternativeDomains: [],
            reasoning: "Vector database returned no matches.",
            recommendationConfidence: 0
        };
    }

    return {
        topDomain: vectorResults[0].domain,
        alternativeDomains: vectorResults.slice(1, 4).map(v => v.domain),
        reasoning: "Generated purely by semantic similarity mapping in the vector space.",
        // Normalize 0-1 similarity to 0-100 scale for confidence
        recommendationConfidence: Math.round(vectorResults[0].similarityScore * 100)
    };
};

/**
 * V3: LLM only
 * Uses raw LLM generation by sending strictly textual data.
 */
const runV3LLMOnly = async (analyticsData) => {
    const systemPrompt = `
You are an academic advisor AI. Given the following user profile, determine:
1. The top recommended academic domain/track.
2. 3 alternative domains.
3. Your reasoning for the top recommendation.
4. A confidence score between 0 and 100.

Return ONLY structured JSON in the exact format:
{
  "topDomain": "string",
  "alternativeDomains": ["string", "string", "string"],
  "reasoning": "string",
  "confidenceScore": number
}
`;

    const userPrompt = `
User Profile:
Cognitive: ${JSON.stringify(analyticsData.cognitiveProfile)}
Strengths: ${JSON.stringify(analyticsData.strengthWeaknessMap?.strengths)}
Passion Score: ${analyticsData.passionScore}
`;

    try {
        const rawLLMResult = await generateLLMResponse(systemPrompt, userPrompt);

        // Safe JSON parsing
        const jsonStart = rawLLMResult.indexOf('{');
        const jsonEnd = rawLLMResult.lastIndexOf('}');
        const jsonString = rawLLMResult.substring(jsonStart, jsonEnd + 1);

        const result = JSON.parse(jsonString);
        return {
            topDomain: result.topDomain,
            alternativeDomains: result.alternativeDomains,
            reasoning: result.reasoning + " (Generated entirely by LLM intelligence).",
            recommendationConfidence: result.confidenceScore
        };
    } catch (err) {
        console.error("V3 LLM Generation failed", err);
        return {
            topDomain: "Failed to generate LLM mapping",
            alternativeDomains: [],
            reasoning: "LLM parse error.",
            recommendationConfidence: 0
        };
    }
};

/**
 * V4: Hybrid (Analytics + RAG + LLM)
 * Uses the pre-built hybrid recommendation engine.
 */
const runV4Hybrid = async (analyticsData) => {
    try {
        const hybridResults = await generateHybridRecommendations(analyticsData);
        // Map to exact format for experiment report
        return {
            topDomain: hybridResults.topDomain,
            alternativeDomains: hybridResults.alternativeDomains,
            reasoning: hybridResults.reasoning,
            recommendationConfidence: Math.round(hybridResults.confidenceScore)
        };
    } catch (error) {
        return {
            topDomain: "Failed hybrid computation",
            alternativeDomains: [],
            reasoning: "Hybrid error.",
            recommendationConfidence: 0
        };
    }
};


/**
 * ----------------------------------------------------
 * Core Experiment Execution Module
 * Runs A/B/C/D testing across algorithms, logs metrics,
 * and outputs the comparison report.
 * ----------------------------------------------------
 */

/**
 * Compares 4 recommendation approaches on a given user's latest analytics state.
 * @param {String} userId - Unique user ID
 * @returns {Promise<Object>} The structured comparison report
 */
const runAlgorithmComparison = async (userId) => {
    try {
        if (!userId) {
            throw new Error("userId is required to run comparison module.");
        }

        // 1. Read latest finalized state from user analytics model
        const userAnalytics = await UserAnalytics.findOne({ userId });
        if (!userAnalytics) {
            throw new Error(`Cannot run experiment. No analytics profile exists for user ${userId}.`);
        }

        // 2. Execute all 4 algorithms in parallel to generate the comparative baseline outputs
        const [v1_results, v2_results, v3_results, v4_results] = await Promise.all([
            Promise.resolve(runV1RuleBased(userAnalytics)),     // Sync wrapped in Promise resolve
            runV2VectorSimilarity(userAnalytics),               // Async Vector fetch
            runV3LLMOnly(userAnalytics),                        // Async LLM Fetch
            runV4Hybrid(userAnalytics)                          // Async Hybrid fetch
        ]);

        // 3. Prepare structured variants for the Document storage
        // Baseline default metrics (0 or empty user feedback) are applied until user acts on them.
        const variantsData = [
            {
                variantId: "V1",
                algorithmUsed: "Rule-based only",
                recommendationOutput: v1_results,
                metrics: { recommendationConfidence: v1_results.recommendationConfidence }
            },
            {
                variantId: "V2",
                algorithmUsed: "Vector similarity only",
                recommendationOutput: v2_results,
                metrics: { recommendationConfidence: v2_results.recommendationConfidence }
            },
            {
                variantId: "V3",
                algorithmUsed: "LLM only",
                recommendationOutput: v3_results,
                metrics: { recommendationConfidence: v3_results.recommendationConfidence }
            },
            {
                variantId: "V4",
                algorithmUsed: "Hybrid (Analytics + RAG + LLM)",
                recommendationOutput: v4_results,
                metrics: { recommendationConfidence: v4_results.recommendationConfidence }
            }
        ];

        // 4. Safely store the new experiment results baseline
        const experimentLog = new ExperimentResult({
            userId,
            variants: variantsData
        });

        await experimentLog.save();

        // 5. Build full comparison report to return to the controller/API
        const comparisonReport = {
            reportId: experimentLog._id,
            experimentId: experimentLog.experimentId,
            userId,
            analyticsStateSnapshot: {
                interestVector: userAnalytics.interestVector,
                cognitiveProfile: userAnalytics.cognitiveProfile
            },
            runTimestamp: experimentLog.timestamp,
            approaches: variantsData.map(v => ({
                approach: `${v.variantId} - ${v.algorithmUsed}`,
                topRecommendation: v.recommendationOutput.topDomain,
                alternativeRecommendations: v.recommendationOutput.alternativeDomains,
                algorithmReasoning: v.recommendationOutput.reasoning,
                internalConfidence: `${v.metrics.recommendationConfidence}%`
            }))
        };

        return comparisonReport;

    } catch (error) {
        console.error(`[AlgorithmComparisonService Error]: Experiment failed for user ${userId}`, error);
        throw error;
    }
};

module.exports = {
    runAlgorithmComparison
};
