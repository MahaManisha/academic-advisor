/**
 * Analytics Engine Service
 * 
 * Core intelligence layer for analyzing user profiles.
 * Computes interest vectors, cognitive profiles, passion scores, and other metrics
 * using a weighted scoring logic based on user interaction and assessment data.
 */

// In-memory store for user analytics state (for demo/processing purposes).
// In a real production system, this would likely be backed by a database (MongoDB/Redis)
const userAnalyticsStore = new Map();

/**
 * Valid domain categories for the interest vector
 */
const DOMAINS = ['AI', 'DataScience', 'WebDev', 'CoreCS', 'Research', 'UIUX'];

/**
 * Initializes a blank analytics profile for a new user
 * @param {String} userId - The unique identifier for the user
 * @returns {Object} The initialized analytics state
 */
const initializeUserAnalytics = (userId) => {
    try {
        if (!userId) {
            throw new Error("userId is required to initialize analytics.");
        }

        const initialState = {
            userId,
            interestVector: {
                AI: 0,
                DataScience: 0,
                WebDev: 0,
                CoreCS: 0,
                Research: 0,
                UIUX: 0
            },
            passionScore: 0,
            strengthWeaknessMap: {
                strengths: [],
                weaknesses: []
            },
            cognitiveProfile: {
                Analytical: 0,
                Creative: 0,
                Logical: 0,
                Practical: 0
            },
            confidenceScore: 0,
            recommendedTracks: [],
            lastUpdated: new Date()
        };

        userAnalyticsStore.set(userId, initialState);
        return initialState;

    } catch (error) {
        console.error(`[AnalyticsEngine Error]: Failed to initialize for user ${userId}`, error);
        throw error;
    }
};

/**
 * Updates the user's interest vector based on new response data.
 * @param {String} userId - The unique identifier for the user
 * @param {Object} responseData - Data containing domain preferences and enthusiasm weights
 * @returns {Object} Updated interest vector
 */
const updateInterestVector = (userId, responseData) => {
    try {
        if (!userId || !responseData) {
            throw new Error("userId and responseData are required.");
        }

        const userState = userAnalyticsStore.get(userId) || initializeUserAnalytics(userId);

        // Extracting preferences and their corresponding weights (default weight: 1.0)
        // Example responseData format: { AI: 2.5, WebDev: 1.2, enthusiasm: 0.8 }

        DOMAINS.forEach(domain => {
            if (responseData[domain] !== undefined) {
                // Apply a simple weighted addition
                const weight = responseData.enthusiasm || 1.0;
                userState.interestVector[domain] += (responseData[domain] * weight);

                // Cap the domain interest value at a max of 100 for normalization
                userState.interestVector[domain] = Math.min(100, userState.interestVector[domain]);
            }
        });

        // Update passion score incrementally based on enthusiasm interactions
        if (responseData.enthusiasm) {
            userState.passionScore = Math.min(100, userState.passionScore + (responseData.enthusiasm * 5));
        }

        userState.lastUpdated = new Date();
        userAnalyticsStore.set(userId, userState);

        return userState.interestVector;

    } catch (error) {
        console.error(`[AnalyticsEngine Error]: Failed to update interest vector for user ${userId}`, error);
        throw error;
    }
};

/**
 * Calculates domain affinities to identify strengths and weaknesses.
 * @param {String} userId - The unique identifier for the user
 * @returns {Object} strengthWeaknessMap
 */
const calculateDomainAffinity = (userId) => {
    try {
        const userState = userAnalyticsStore.get(userId);

        if (!userState) {
            throw new Error("Analytics state not initialized for user. Cannot calculate domain affinity.");
        }

        const strengths = [];
        const weaknesses = [];
        const threshold = 50; // Threshold for evaluating strength versus weakness

        // Evaluate each domain based on current interest/aptitude scoring
        Object.entries(userState.interestVector).forEach(([domain, score]) => {
            if (score >= threshold) {
                strengths.push({ domain, score });
            } else if (score < (threshold / 2)) {
                weaknesses.push({ domain, score }); // Very low scores are marked as weaknesses
            }
        });

        // Sort by score descending for strengths and ascending for weaknesses
        strengths.sort((a, b) => b.score - a.score);
        weaknesses.sort((a, b) => a.score - b.score);

        userState.strengthWeaknessMap = { strengths, weaknesses };
        userAnalyticsStore.set(userId, userState);

        return userState.strengthWeaknessMap;

    } catch (error) {
        console.error(`[AnalyticsEngine Error]: Failed to calculate domain affinity for user ${userId}`, error);
        throw error;
    }
};

/**
 * Approximates a user's cognitive profile based on their domain strengths
 * @param {String} userId - The unique identifier for the user
 * @returns {Object} Mapping of cognitive traits (Analytical, Creative, Logical, Practical)
 */
const calculateCognitiveProfile = (userId) => {
    try {
        const userState = userAnalyticsStore.get(userId);
        if (!userState) {
            throw new Error("Analytics state not initialized. Cannot calculate cognitive profile.");
        }

        const vectors = userState.interestVector;

        // Apply heuristic weighting logic to derive cognitive features from domain interests
        userState.cognitiveProfile.Analytical = Math.min(100, (vectors.DataScience * 0.6) + (vectors.Research * 0.4));
        userState.cognitiveProfile.Creative = Math.min(100, (vectors.UIUX * 0.7) + (vectors.WebDev * 0.3));
        userState.cognitiveProfile.Logical = Math.min(100, (vectors.AI * 0.5) + (vectors.CoreCS * 0.5));
        userState.cognitiveProfile.Practical = Math.min(100, (vectors.WebDev * 0.5) + (vectors.DataScience * 0.5));

        userAnalyticsStore.set(userId, userState);

        return userState.cognitiveProfile;

    } catch (error) {
        console.error(`[AnalyticsEngine Error]: Failed to calculate cognitive profile for user ${userId}`, error);
        throw error;
    }
};

/**
 * Generates the final comprehensive analytics profile representing the user
 * and determines the recommended tracks.
 * @param {String} userId - The unique identifier for the user
 * @returns {Object} Complete generalized analytics snapshot
 */
const generateFinalAnalytics = (userId) => {
    try {
        const userState = userAnalyticsStore.get(userId);
        if (!userState) {
            throw new Error("Record not found. Initialize user first.");
        }

        // Recalculate intermediate aspects to ensure everything is up to date
        calculateDomainAffinity(userId);
        calculateCognitiveProfile(userId);

        // Derive confidence score: based loosely on passion score and the average top domain score
        const topStrength = userState.strengthWeaknessMap.strengths[0]?.score || 0;
        userState.confidenceScore = Math.min(100, (userState.passionScore * 0.4) + (topStrength * 0.6));

        // Generate recommendations using heuristic logic matching highest traits
        // This acts as a placeholder for more advanced recommendation models
        const recommendations = [];
        const { Analytical, Creative, Logical, Practical } = userState.cognitiveProfile;

        if (Logical >= 60 && Analytical >= 50) recommendations.push('Machine Learning Engineering');
        if (Creative >= 60 && Practical >= 50) recommendations.push('Frontend & UI/UX Design');
        if (Analytical >= 70) recommendations.push('Data Science & Analytics');
        if (Logical >= 70 && userState.passionScore >= 50) recommendations.push('Backend Architecture');
        if (userState.interestVector.Research >= 60) recommendations.push('Academic & Deep Learning Research');

        // Fallback default track if no strong signals
        if (recommendations.length === 0) {
            recommendations.push('Full-Stack Web Development');
        }

        userState.recommendedTracks = recommendations;
        userState.lastUpdated = new Date();
        userAnalyticsStore.set(userId, userState);

        return {
            userId: userState.userId,
            interestVector: userState.interestVector,
            passionScore: userState.passionScore,
            strengthWeaknessMap: userState.strengthWeaknessMap,
            cognitiveProfile: userState.cognitiveProfile,
            confidenceScore: userState.confidenceScore,
            recommendedTracks: userState.recommendedTracks,
            lastUpdated: userState.lastUpdated
        };

    } catch (error) {
        console.error(`[AnalyticsEngine Error]: Failed to generate final analytics for user ${userId}`, error);
        throw error;
    }
};

module.exports = {
    initializeUserAnalytics,
    updateInterestVector,
    calculateDomainAffinity,
    calculateCognitiveProfile,
    generateFinalAnalytics
};
