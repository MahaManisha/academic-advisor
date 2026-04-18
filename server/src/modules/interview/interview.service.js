import Groq from "groq-sdk";

const getGroqClient = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not defined in environment variables");
    }
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export const generateInterviewQuestions = async (company, role, difficulty = "medium") => {
    try {
        const prompt = `Act as an expert technical recruiter and interviewer. 
Provide 10 authentic, commonly asked previous-year interview questions for a "${role}" at "${company}" with a "${difficulty}" difficulty level.

Categorize the questions into:
- Technical / Coding
- System Design / Architecture
- Core Subjects (OS, DBMS, Networks, etc. if applicable)
- Behavioral / HR

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
