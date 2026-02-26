// server/src/modules/chatbot/chat.service.js
import Groq from "groq-sdk";
import Chat from "./chat.model.js";
import User from "../user/user.model.js";

// ── Groq client (free tier — no billing needed) ──────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Free Groq models in priority order (fallback chain)
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",   // Best quality — 6,000 req/day free
  "llama-3.1-8b-instant",      // Fastest — 14,400 req/day free
  "gemma2-9b-it",              // Google Gemma — 14,400 req/day free
  "mixtral-8x7b-32768",        // Mixtral — good reasoning
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Try each model until one responds. */
const generateWithFallback = async (messages) => {
  let lastError = null;

  for (const model of GROQ_MODELS) {
    try {

      const completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      });
      const text = completion.choices[0]?.message?.content || "";

      return text;
    } catch (err) {
      const msg = err?.message || String(err);
      const is429 =
        msg.includes("429") ||
        msg.includes("rate_limit") ||
        msg.includes("Rate limit");

      if (is429) {
        // Extract retry delay or wait 12 s
        const sec = (msg.match(/Please try again in (\d+(?:\.\d+)?)s/) || [])[1];
        const wait = sec ? Math.ceil(parseFloat(sec)) + 1 : 12;
        console.warn(`[Chatbot] ⚠️  ${model} rate-limited. Waiting ${wait}s…`);
        await sleep(wait * 1000);
        lastError = err;
        continue;
      }

      // Surface any other error immediately
      throw err;
    }
  }

  throw lastError || new Error("All Groq models are currently unavailable.");
};

// ── Main handler ─────────────────────────────────────────────────────────────
export const handleChat = async (userId, question) => {
  // 1. Fetch Student Context
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const course = user.course || "General Studies";
  const focus = user.focus || "Academic";
  const style = user.learningMode || "Visual";
  const score = user.knowledgeScore || "not assessed";

  // 2. Build messages array (system + user)
  const messages = [
    {
      role: "system",
      content: `You are an expert AI Academic Advisor for an e-learning platform.

STUDENT PROFILE:
- Name: ${user.name || "Student"}
- Course / Major: ${course}
- Learning Focus: ${focus}
- Preferred Learning Style: ${style}
- Current Knowledge Score: ${score}

INSTRUCTIONS:
- Give personalised, actionable academic advice based on the student profile.
- When asked for resources, provide real URLs (YouTube, GeeksForGeeks, freeCodeCamp, Khan Academy, Coursera, W3Schools, LeetCode, etc.).
- Use markdown formatting: **bold** for key terms, bullet lists for resources, \`code\` for snippets.
- Be concise (under 250 words) unless deep explanation is genuinely needed.
- Be friendly, encouraging, and specific — NEVER give a generic non-answer.
- Do NOT say you cannot browse the internet for well-known, established resources.`,
    },
    {
      role: "user",
      content: question,
    },
  ];

  // 3. Call Groq API (with automatic model fallback)
  let aiResponse = "";
  try {
    aiResponse = await generateWithFallback(messages);
  } catch (groqErr) {
    const errMsg = groqErr?.message || String(groqErr);
    console.error("[Chatbot] All Groq models failed:", errMsg);

    if (errMsg.includes("429") || errMsg.includes("rate_limit")) {
      aiResponse = `⚠️ **Rate Limit Reached**\n\nThe AI service is temporarily busy. Please wait a moment and try again.\n\n*(Tip: The limit resets every minute — just send your message again in a few seconds.)*`;
    } else {
      aiResponse = `I'm sorry, I couldn't reach the AI service right now. Please try again in a moment.`;
    }
  }

  // 4. Persist the conversation
  await Chat.create({ userId, role: "user", message: question });
  await Chat.create({ userId, role: "assistant", message: aiResponse, confidenceScore: 0.95 });

  return {
    response: aiResponse,
    confidence: 0.95,
    contextUsed: { focus, style, course },
  };
};
