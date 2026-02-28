const Groq = require('groq-sdk');

// Ensure Groq API key is defined in the environment, not hardcoded
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Standardized modular helper for calling the LLM.
 * @param {String} systemPrompt - Instructions for the LLM.
 * @param {String} userPrompt - Context or user information.
 * @returns {Promise<String>} Generated response content.
 */
const generateLLMResponse = async (systemPrompt, userPrompt) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not defined in the environment.');
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            model: "llama3-8b-8192", // Using an open and capable model; feel free to change
            temperature: 0.7,
            max_tokens: 300
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("[LLM Helper Error]: Failed to generate response.", error);
        throw error;
    }
};

module.exports = {
    generateLLMResponse
};
