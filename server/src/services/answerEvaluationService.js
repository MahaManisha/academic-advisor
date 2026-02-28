const { generateLLMResponse } = require('../utils/llmHelper');

/**
 * Answer Evaluation Service
 * 
 * Takes a user's free-text assessment answer, sends it to the LLM, and extracts
 * structured JSON metrics for domain vectors, enthusiasm, and cognitive components.
 */

/**
 * Validates and parses the LLM JSON response.
 * @param {String} rawResponse 
 * @returns {Object} 
 */
const parseResponseSafe = (rawResponse) => {
    try {
        // Find JSON boundaries just in case LLM adds markdown or fluff text
        const jsonStart = rawResponse.indexOf('{');
        const jsonEnd = rawResponse.lastIndexOf('}');

        if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error("No JSON structure found in LLM response");
        }

        const jsonString = rawResponse.substring(jsonStart, jsonEnd + 1);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("[AnswerEvaluationService Error]: Failed to parse LLM evaluation.", error);
        // Fallback default response ensuring system does not crash
        return {
            domainIndicators: {},
            enthusiasmMarkers: 0,
            complexityHandlingLevel: 0
        };
    }
};

/**
 * Evaluates the user answer against the question context.
 * 
 * @param {String} question 
 * @param {String} answer 
 * @returns {Promise<Object>} Extracted markers matching analytics engine inputs.
 */
const evaluateAnswer = async (question, answer) => {
    try {
        if (!answer || !answer.trim()) {
            return { domainIndicators: {}, enthusiasmMarkers: 0, complexityHandlingLevel: 0 };
        }

        const systemPrompt = `
You are an expert academic text analyzer.
Analyze the user's answer to the provided question.

Extract the following parameters and return ONLY strict JSON:
1. domainIndicators: An object mapping domains to weight scores (0.0 to 3.0) based on relevance in the answer. Valid domains: "AI", "DataScience", "WebDev", "CoreCS", "Research", "UIUX".
2. enthusiasmMarkers: A score (0.0 to 2.0) based on passion, detail, and positive tone in the answer.
3. complexityHandlingLevel: A score (0.0 to 1.0) indicating how well they handled complex logic or scenarios.

Format:
{
  "domainIndicators": { "WebDev": 1.5, "UIUX": 0.5 },
  "enthusiasmMarkers": 0.8,
  "complexityHandlingLevel": 0.5
}

DO NOT return any other text outside the JSON block.
`;

        const userContextPrompt = `
Question Asked:
${question}

User's Answer:
${answer}
`;

        const rawLLMResult = await generateLLMResponse(systemPrompt, userContextPrompt);
        return parseResponseSafe(rawLLMResult);

    } catch (error) {
        console.error("[AnswerEvaluationService Error]: Failed to evaluate answer", error);
        throw error;
    }
};

module.exports = {
    evaluateAnswer
};
