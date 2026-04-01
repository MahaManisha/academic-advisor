import FlashcardSet from "./flashcard.model.js";
import Groq from "groq-sdk";

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateFlashcards = async (req, res, next) => {
    try {
        const { text, title } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: "Source text is required." });
        }

        const systemPrompt = `You are an expert AI study assistant. Your task is to analyze the provided educational text and output a JSON object containing:
1. 'summary': A concise string with 3-4 bullet points summarizing the key ideas.
2. 'cards': An array of objects, each containing a 'question' and an 'answer' based on important concepts from the text. Generate exactly 5 flashcards.

Return ONLY a valid JSON object matching this schema. Do not include markdown blocks or other text.
{
  "summary": "...",
  "cards": [
    { "question": "...", "answer": "..." }
  ]
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text.substring(0, 4000) } // Prevent massive payload crashes
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3, // precise responses needed for JSON
            response_format: { type: "json_object" }
        });

        const llmResponse = completion.choices[0]?.message?.content;

        let parsedData;
        try {
            parsedData = JSON.parse(llmResponse);
        } catch (e) {
            console.error("Failed to parse LLM response into JSON", llmResponse);
            return res.status(500).json({ success: false, message: "AI failed to generate structural format." });
        }

        const newSet = new FlashcardSet({
            user: req.user.id || req.user.userId,
            title: title || "AI Generated Deck",
            summary: parsedData.summary,
            cards: parsedData.cards || []
        });

        await newSet.save();

        res.status(201).json({ success: true, flashcardSet: newSet });
    } catch (error) {
        console.error("Flashcard Gen Error:", error);
        res.status(500).json({ success: false, message: "AI Generation failed", error: error.message });
    }
};

export const getMyFlashcardSets = async (req, res, next) => {
    try {
        const sets = await FlashcardSet.find({ user: req.user.id || req.user.userId }).sort({ createdAt: -1 });
        res.json({ success: true, sets });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch sets", error: error.message });
    }
};

export const getFlashcardSet = async (req, res, next) => {
    try {
        const set = await FlashcardSet.findById(req.params.id);
        if (!set) return res.status(404).json({ success: false, message: "Set not found." });

        // simple ownership check
        if (set.user.toString() !== (req.user.id || req.user.userId).toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized." });
        }

        res.json({ success: true, set });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch set", error: error.message });
    }
};
