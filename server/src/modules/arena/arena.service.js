import Groq from "groq-sdk";

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateArenaQuiz = async (topic) => {
    try {
        const prompt = `Generate a 5-question multiple choice quiz on the topic: "${topic}". 
Generate the quiz slightly difficult but fair to challenge college/university students.
Return ONLY a valid JSON array matching this exact format, with 4 options per question:
[
  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswerIndex": 2
  }
]`;

        const systemPrompt = "You are a strict JSON generator for multiple-choice quizzes. Return only JSON.";

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 1000,
            response_format: { type: "json_object" }
        });

        const responseJsonStr = completion.choices[0]?.message?.content || "[]";

        const quizData = JSON.parse(responseJsonStr);
        return quizData;
    } catch (e) {
        console.error("Arena Quiz Gen Error:", e);
        // Fallback quiz in case LLM fails
        return [
            {
                question: "What does AI stand for?",
                options: ["Artificial Intelligence", "Automated Interface", "Analog Input", "Audio Integration"],
                correctAnswerIndex: 0
            },
            {
                question: "Which of these is a popular programming language?",
                options: ["Python", "Snake", "Viper", "Cobra"],
                correctAnswerIndex: 0
            },
            {
                question: "What is 2 + 2?",
                options: ["3", "4", "5", "6"],
                correctAnswerIndex: 1
            },
            {
                question: "Which data structure uses LIFO?",
                options: ["Queue", "Tree", "Graph", "Stack"],
                correctAnswerIndex: 3
            },
            {
                question: "What does CPU stand for?",
                options: ["Computer Personal Unit", "Central Processing Unit", "Central Process Unit", "Core Processing Unit"],
                correctAnswerIndex: 1
            }
        ];
    }
};
