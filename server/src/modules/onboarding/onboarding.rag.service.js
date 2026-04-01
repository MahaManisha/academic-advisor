import Groq from "groq-sdk";
import { getDiagnosticTestPrompt, getDiagnosticEvaluationPrompt } from "./onboarding.prompt.js";
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
        "Computer Science": "Data Structures cover Trees, Graphs, Hash Maps, and Linked Lists. Operating Systems deal with concurrency, memory management, and process scheduling. Algorithms focus on sorting, searching, and dynamic programming.",
        "Mechanical": "Thermodynamics covers laws of thermal energy transfer. Fluid mechanics focuses on viscosity and flow dynamics. Statics deals with forces on stationary bodies.",
        "Biology": "Cell biology covers the structure of eukaryotic vs prokaryotic cells, mitosis, and meiosis. Genetics deals with inheritance, DNA structure, and mutations.",
        "default": "Basic analytical thinking involves logically deducing facts from given premises and avoiding logical fallacies. Problem-solving includes breaking down complex tasks."
    };
    return contexts[domain] || contexts["default"];
};

export const retrieveSyllabusChunks = async (domain, syllabusUrl = null) => {
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

export const generateDiagnosticTest = async (domain, accessibilityPrefs = {}, syllabusUrl = null) => {
    try {
        const retrievedChunks = await retrieveSyllabusChunks(domain, syllabusUrl);
        const prompt = getDiagnosticTestPrompt(retrievedChunks, domain, accessibilityPrefs);

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
        console.error("Diagnostic Test Generation Error:", error);
        throw new Error("Failed to generate diagnostic test.");
    }
};

export const evaluateDiagnosticTest = async (domain, questions, studentAnswers, syllabusUrl = null) => {
    try {
        const prompt = getDiagnosticEvaluationPrompt(domain, questions, studentAnswers);

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
        console.error("Diagnostic Evaluation Error:", error);
        throw new Error("Failed to evaluate diagnostic test.");
    }
};
