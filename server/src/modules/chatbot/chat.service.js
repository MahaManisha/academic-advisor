// server/src/modules/chatbot/chat.service.js
import Chat from "./chat.model.js";
import StudentProfile from "../studentProfile/studentProfile.model.js";
import StudyPlan from "../studyPlanner/studyPlan.model.js";
import AssessmentAttempt from "../assessment/assessmentAttempt.model.js";
import { buildAdvisorPrompt } from "./prompt.builder.js";
import { calculateConfidence } from "./confidence.utils.js";

export const handleChat = async (userId, question) => {
  const profile = await StudentProfile.findOne({ userId });
  const studyPlan = await StudyPlan.findOne({ userId, active: true });
  const assessments = await AssessmentAttempt.find({ userId })
    .sort({ createdAt: -1 })
    .limit(3);

  if (!profile) {
    throw new Error("Student profile not found");
  }

  const prompt = buildAdvisorPrompt({
    profile,
    studyPlan,
    assessments,
    question
  });

  // 🔁 TEMP MOCK (replace with OpenAI / Gemini later)
  const aiResponse =
    "Here is a step-by-step strategy to improve your performance based on your current skill level.";

  const confidence = calculateConfidence(aiResponse);
  const fallbackSuggested = confidence < 0.6;

  // Save user message
  await Chat.create({
    userId,
    role: "user",
    message: question
  });

  // Save assistant response
  await Chat.create({
    userId,
    role: "assistant",
    message: aiResponse,
    confidenceScore: confidence,
    fallbackSuggested
  });

  return {
    response: aiResponse,
    confidence,
    fallbackSuggested
  };
};
