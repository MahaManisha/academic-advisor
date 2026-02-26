// server/src/modules/onboarding/onboarding.rag.service.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getQuestionGenerationPrompt, getAnswerEvaluationPrompt } from "./onboarding.prompt.js";

const getGenAI = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

export const retrieveSyllabusChunks = async (domain, previousAnalysis, difficulty) => {
    // In a real RAG setup, we query a vector DB (e.g., Pinecone or Chroma) using embeddings computed from 'previousAnalysis.weaknesses' or domain name.
    // Here we'll mock the retrieval step.
    return getMockSyllabusContext(domain);
};

export const generateAdaptiveQuestion = async (domain, difficultyLevel, previousAnalysis = null) => {
    try {
        const retrievedChunks = await retrieveSyllabusChunks(domain, previousAnalysis, difficultyLevel);
        const prompt = getQuestionGenerationPrompt(retrievedChunks, previousAnalysis, difficultyLevel, domain);

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("Adaptive Question Generation Error:", error);
        throw new Error("Failed to generate adaptive question.");
    }
};

export const evaluateAdaptiveAnswer = async (domain, question, studentAnswer) => {
    try {
        const retrievedChunks = await retrieveSyllabusChunks(domain, null, question.difficulty);
        const prompt = getAnswerEvaluationPrompt(retrievedChunks, question, studentAnswer);

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("Adaptive Evaluation Error:", error);
        throw new Error("Failed to evaluate adaptive answer.");
    }
};
