// server/src/modules/chatbot/prompt.builder.js
export const buildAdvisorPrompt = ({
  profile,
  studyPlan,
  assessments,
  question
}) => {
  return `
You are an AI Academic Advisor.

STUDENT PROFILE:
Skills:
${profile.skills.map(s => `- ${s.domain}: ${s.level}`).join("\n")}

CURRENT STUDY PLAN:
${studyPlan?.tasks?.length
  ? studyPlan.tasks.map(t => `- ${t.title}`).join("\n")
  : "No active study plan"}

RECENT ASSESSMENTS:
${assessments.length
  ? assessments.map(a => `${a.domain}: ${a.inferredLevel}`).join(", ")
  : "No recent assessments"}

RULES:
- Explain step by step
- Be concise and accurate
- Do NOT hallucinate
- If unsure, clearly state uncertainty

STUDENT QUESTION:
"${question}"
`;
};
