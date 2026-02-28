/**
 * Hybrid Recommendation Engine
 * 
 * Combines structural analytics scores (70%) with semantic vector similarity scores (30%)
 * to generate course and domain recommendations.
 */

// Simulated Vector DB Client (e.g., Pinecone, FAISS, Chroma)
// Replace with actual SDK imports and initializations (e.g., @pinecone-database/pinecone)
const queryVectorDB = async (queryVectorOrText, topK = 5) => {
    // In a real implementation:
    // const results = await index.query({ vector: queryVector, topK, includeMetadata: true });

    // Mocked response representing vector search results
    // Scores here resemble cosine similarity (0.0 to 1.0)
    return [
        { domain: 'Data Science & Analytics', similarityScore: 0.88 },
        { domain: 'Machine Learning Engineering', similarityScore: 0.82 },
        { domain: 'Full-Stack Web Development', similarityScore: 0.75 },
        { domain: 'Backend Architecture', similarityScore: 0.65 },
        { domain: 'Frontend & UI/UX Design', similarityScore: 0.60 }
    ];
};

/**
 * Normalizes scores to a 0-100 scale for easier combination.
 * @param {Number} score - Vector similarity score usually between 0.0 and 1.0
 * @returns {Number} 0-100 scale score
 */
const normalizeVectorScore = (score) => {
    return Math.min(100, Math.max(0, score * 100)); // Ensure it's 0-100
};

/**
 * Utility to map string formats or extract domain labels accurately
 */
const extractDomainString = (domainObject) => {
    return domainObject.domain ? domainObject.domain : domainObject;
};

/**
 * Calculates a unified score using a weighted hybrid approach.
 * Analytics Engine Weight: 70%
 * Vector DB Similarity Weight: 30%
 */
const computeHybridScore = (analyticsScore, vectorScore) => {
    const analyticsWeight = 0.70;
    const vectorWeight = 0.30;
    return (analyticsScore * analyticsWeight) + (vectorScore * vectorWeight);
};

/**
 * Generates hybrid recommendations by fusing user analytics data and vector database similarities.
 * 
 * @param {Object} analyticsData - The structured output from the internal Analytics Engine
 * @param {Object} analyticsData.interestVector - User's domain interest scores
 * @param {Object} analyticsData.cognitiveProfile - Analytical/Creative/Logical/Practical profile
 * @param {Object} analyticsData.strengthWeaknessMap - Detected user strengths and weaknesses
 * @returns {Promise<Object>} The unified recommendation profile
 */
const generateHybridRecommendations = async (analyticsData) => {
    try {
        const { interestVector, cognitiveProfile, strengthWeaknessMap } = analyticsData;

        if (!interestVector) {
            throw new Error("Missing required 'interestVector' for hybrid recommendation.");
        }

        // 1. Build a textual or mathematical query representation for the Vector DB
        // Using a textual representation to simulate an embedding query
        const queryText = `
            Interests: ${JSON.stringify(interestVector)}
            Cognitive Profile: ${JSON.stringify(cognitiveProfile)}
            Strengths: ${strengthWeaknessMap?.strengths?.map(extractDomainString).join(', ')}
        `.trim();

        // 2. Query the vector database to retrieve semantic matches
        // In a real implementation: `const queryEmbedding = await generateEmbedding(queryText);`
        const vectorResults = await queryVectorDB(queryText, 5);

        // 3. Compute hybrid scores
        const domainScores = new Map();

        // Pass 1: Add Vector DB scores (30% weight)
        vectorResults.forEach(match => {
            const rawVectorScore = normalizeVectorScore(match.similarityScore);
            // Assuming an initial analytics score of 50 for domains only found in vector DB as baseline
            domainScores.set(match.domain, {
                vectorScore: rawVectorScore,
                analyticsScore: 50,
                hybridScore: computeHybridScore(50, rawVectorScore)
            });
        });

        // Pass 2: Merge Analytics engine scores (70% weight)
        // This maps the normalized interest vectors directly to the domains
        let isMap = typeof interestVector.forEach === "function"; // Handle Map or Object
        const processDomainScore = (domain, score) => {
            // Normalize internal analytics score (assuming it's max 100)
            const aScore = Math.min(100, score);

            // Heuristic matching map (Analytics Domains -> Vector DB domains)
            let matchedDbDomain = domain; // Fallback
            if (domain === 'DataScience' || domain === 'Research') matchedDbDomain = 'Data Science & Analytics';
            if (domain === 'AI') matchedDbDomain = 'Machine Learning Engineering';
            if (domain === 'WebDev') matchedDbDomain = 'Full-Stack Web Development';
            if (domain === 'UIUX') matchedDbDomain = 'Frontend & UI/UX Design';
            if (domain === 'CoreCS') matchedDbDomain = 'Backend Architecture';

            const currentScores = domainScores.get(matchedDbDomain) || { vectorScore: 0, analyticsScore: 0 };

            // Recompute combining both factors safely
            currentScores.analyticsScore = aScore;
            currentScores.hybridScore = computeHybridScore(aScore, currentScores.vectorScore);

            domainScores.set(matchedDbDomain, currentScores);
        };

        if (isMap) {
            interestVector.forEach((score, domain) => processDomainScore(domain, score));
        } else {
            Object.entries(interestVector).forEach(([domain, score]) => processDomainScore(domain, score));
        }

        // Sort domains strictly by the calculated hybridScore descending
        const rankedDomains = Array.from(domainScores.entries())
            .map(([domainName, scores]) => ({
                domain: domainName,
                hybridScore: scores.hybridScore,
                analyticsScore: scores.analyticsScore,
                vectorScore: scores.vectorScore
            }))
            .sort((a, b) => b.hybridScore - a.hybridScore);

        if (rankedDomains.length === 0) {
            throw new Error("No domain recommendations could be ranked.");
        }

        // 4. Generate structured output
        const topDomain = rankedDomains[0].domain;
        const topScore = rankedDomains[0].hybridScore;
        const alternativeDomains = rankedDomains.slice(1, 4).map(d => d.domain);

        const confidenceScore = topScore;

        // Generate reasoning logic dynamically for transparency
        let reasoning = `The top recommendation of ${topDomain} was selected with a confidence of ${Math.round(confidenceScore)}%. `;
        reasoning += `This matches your analytical strengths (${Math.round(rankedDomains[0].analyticsScore)}% signal) `;
        if (rankedDomains[0].vectorScore > 0) {
            reasoning += `and aligns well semantically with successful industry learning paths (${rankedDomains[0].vectorScore}% similarity match).`;
        }

        return {
            topDomain,
            alternativeDomains,
            reasoning,
            confidenceScore: Number(confidenceScore.toFixed(2)),

            // 5. Keep scoring logic transparent
            _transparentScoringMap: rankedDomains
        };

    } catch (error) {
        console.error("[HybridRecommendationEngine Error]: Failed to generate recommendations.", error);
        throw error;
    }
};

module.exports = {
    generateHybridRecommendations,
    queryVectorDB,
    computeHybridScore
};
