import Groq from "groq-sdk";
import { getQuestionGenerationPrompt, getAnswerEvaluationPrompt } from "./onboarding.prompt.js";
import { scrapeSyllabus } from "../../utils/scrape.service.js";

const getGroqClient = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not defined in environment variables");
    }
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// Fallback static context since we do not have a full Vector Database populated
const getMockSyllabusContext = (domain) => {
    const contexts = {
        "Computer Science": "Data Structures cover Trees, Graphs, Hash Maps, and Linked Lists. Operating Systems deal with concurrency, memory management, and process scheduling.",
        "Mechanical": "Thermodynamics covers laws of thermal energy transfer. Fluid mechanics focuses on viscosity and flow dynamics.",
        "Biology": "Cell biology covers the structure of eukaryotic vs prokaryotic cells, mitosis, and meiosis.",
        "default": "Basic analytical thinking involves logically deducing facts from given premises and avoiding logical fallacies."
    };
    return contexts[domain] || contexts["default"];
};

export const retrieveSyllabusChunks = async (domain, previousAnalysis, difficulty, syllabusUrl = null) => {
    // If we have a given syllabus, use it as context. 
    if (syllabusUrl) {
        try {
            const contextText = await scrapeSyllabus(syllabusUrl);
            if (contextText && contextText.trim().length > 50) {
                // Slice it to ~4000 characters to fit well within Groq's prompt limits for fast inference
                return `[LIVE SYLLABUS CONTEXT]:\n${contextText.slice(0, 4000)}\n\n[USER DOMAIN FOCUS]: ${domain}`;
            }
        } catch (error) {
            console.error("Failed to fetch custom syllabus for adaptive context. Using fallback.", error.message);
        }
    }

    // Fallback if no URL or if scraping fails.
    return getMockSyllabusContext(domain);
};

export const generateAdaptiveQuestion = async (domain, difficultyLevel, previousAnalysis = null, accessibilityPrefs = {}, syllabusUrl = null) => {
    try {
        const retrievedChunks = await retrieveSyllabusChunks(domain, previousAnalysis, difficultyLevel, syllabusUrl);
        const prompt = getQuestionGenerationPrompt(retrievedChunks, previousAnalysis, difficultyLevel, domain, accessibilityPrefs);

        const groq = getGroqClient();
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const text = completion.choices[0]?.message?.content || "{}";
        return JSON.parse(text);
    } catch (error) {
        console.error("Adaptive Question Generation Error:", error);
        throw new Error("Failed to generate adaptive question.");
    }
};

export const evaluateAdaptiveAnswer = async (domain, question, studentAnswer, syllabusUrl = null) => {
    try {
        const retrievedChunks = await retrieveSyllabusChunks(domain, null, question.difficulty, syllabusUrl);
        const prompt = getAnswerEvaluationPrompt(retrievedChunks, question, studentAnswer);

        const groq = getGroqClient();
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const text = completion.choices[0]?.message?.content || "{}";
        return JSON.parse(text);
    } catch (error) {
        console.error("Adaptive Evaluation Error:", error);
        throw new Error("Failed to evaluate adaptive answer.");
    }
};
