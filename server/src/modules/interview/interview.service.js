import Groq from "groq-sdk";

const getGroqClient = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not defined in environment variables");
    }
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export const generateInterviewRounds = async (company, role) => {
    try {
        const prompt = `Act as an expert technical recruiter at ${company}. 
What are the typical interview rounds for a "${role}" position at "${company}"?

Return the response strictly in JSON format as follows:
{
  "rounds": [
    {
      "name": "string (e.g., Online Assessment, Technical Round 1, System Design, HR)",
      "description": "string (short description of what this round tests)"
    }
  ]
}

DO NOT wrap the JSON in Markdown formatting like \`\`\`json. Return ONLY valid JSON.`;

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
        console.error("Interview Rounds Generation Error:", error);
        throw new Error("Failed to generate interview rounds.");
    }
};

export const generateInterviewQuestions = async (company, role, difficulty = "medium", round = "General") => {
    try {
        const prompt = `Act as an expert technical recruiter and interviewer. 
Provide 5-8 authentic, commonly asked previous-year interview questions for a "${role}" at "${company}" with a "${difficulty}" difficulty level.
Crucially, these questions MUST be specifically chosen for the "${round}" round of the interview process.

Categorize the questions appropriately based on the round.
Return the response strictly in JSON format as follows:
{
  "questions": [
    {
      "category": "string",
      "question": "string",
      "difficulty": "string"
    }
  ]
}

DO NOT wrap the JSON in Markdown formatting like \`\`\`json. Return ONLY valid JSON.`;

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
        console.error("Interview Question Generation Error:", error);
        throw new Error("Failed to generate interview questions.");
    }
};
