import Chat from "./chat.model.js";
import User from "../user/user.model.js";

export const handleChat = async (userId, question) => {
  // 1. Fetch User Context
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // 2. Generate Context-Aware Response (Rule-Based "Smart" Agent)
  let aiResponse = "";
  const lowerQ = question.toLowerCase();

  // Context Variables
  const course = user.course || "General Studies";
  const focus = user.focus || "Academic"; // academic, career, research
  const style = user.learningMode || "Visual"; // visual, hands-on, theory

  // Logic Engine
  if (lowerQ.includes('study') || lowerQ.includes('prepare') || lowerQ.includes('learn')) {
    if (style === 'visual') {
      aiResponse = `Since you're a **Visual Learner** studying **${course}**, I recommend starting with diagram-heavy resources. Try watching visualization videos for complex topics. Would you like me to find some video links?`;
    } else if (style === 'hands-on') {
      aiResponse = `For **${course}**, the best way to learn is by doing. I suggest setting up a practical project or using interactive labs. I can suggest a starter project based on your **${focus}** goals.`;
    } else {
      aiResponse = `I recommend gathering standard textbooks and research papers. Organize your notes hierarchically to master the theory of **${course}**.`;
    }
  }
  else if (lowerQ.includes('job') || lowerQ.includes('career') || lowerQ.includes('internship')) {
    if (focus === 'career') {
      aiResponse = `Excellent focus. For a career in **${course}**, you should prioritize building a portfolio. Employers look for practical skills. Have you checked the latest industry requirements?`;
    } else {
      aiResponse = `Even though your focus is **${focus}**, it's good to think ahead. I suggest looking at internship roles relevant to ${course} to see what skills are in demand.`;
    }
  }
  else if (lowerQ.includes('exam') || lowerQ.includes('score') || lowerQ.includes('grade')) {
    aiResponse = `To boost your GPA in **${course}**, focus on past papers and core concepts. Since your knowledge score is around **${user.knowledgeScore || 'average'}**, I'd suggest reviewing the basics before tackling advanced problems.`;
  }
  else {
    aiResponse = `I see you're asking about "${question}". As your advisor for **${course}** (Focus: ${focus}), I'm here to help. Could you be more specific so I can tailor my advice to your **${style}** learning style?`;
  }

  // 3. Save Interaction
  await Chat.create({ userId, role: "user", message: question });
  await Chat.create({ userId, role: "assistant", message: aiResponse, confidenceScore: 1.0 });

  return {
    response: aiResponse,
    confidence: 1.0,
    contextUsed: { focus, style, course }
  };
};
