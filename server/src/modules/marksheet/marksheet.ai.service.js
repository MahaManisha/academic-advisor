// server/src/modules/marksheet/marksheet.ai.service.js
// Uses Groq (Llama 3.3) — the same AI stack as the rest of the app
import Groq from "groq-sdk";

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not defined in environment variables");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// ─── Analyse an entire marksheet ──────────────────────────────────────────────
export const analyzeMarksheetWithAI = async (marksheetData, studentContext) => {
  const groq = getGroqClient();

  const prompt = `You are an academic performance counselor AI. Analyze the student's grade sheet and give a comprehensive, actionable analysis.

STUDENT CONTEXT:
Name: ${studentContext.name || 'Student'}
Department: ${studentContext.department || 'General'}
Degree: ${studentContext.degree || 'UG'}

SEMESTER: ${marksheetData.semester}
SGPA: ${marksheetData.sgpa || 'N/A'}
CGPA: ${marksheetData.cgpa || 'N/A'}
Total Credits: ${marksheetData.totalCredits || 'N/A'}
Credits Earned: ${marksheetData.creditsEarned || 'N/A'}

SUBJECT-WISE PERFORMANCE:
${JSON.stringify(marksheetData.subjects, null, 2)}

INSTRUCTIONS:
1. Identify the student's strongest and weakest subjects based on grade points and marks.
2. Highlight any subjects where the student failed or is at risk.
3. Give specific, actionable improvement strategies for each weak subject.
4. Based on the credit-heavy subjects, suggest career paths or specializations that align with strengths.
5. Give motivational but realistic advice.
6. Structure the response with clearly labeled sections (e.g., STRENGTHS, WEAK AREAS, IMPROVEMENT PLAN, CAREER SUGGESTIONS).
7. Plain text only — no markdown asterisks or hashtags. Use CAPS for section headings.

Keep the total response under 400 words.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || "Analysis unavailable.";
};

// ─── Analyse a single subject by credits ──────────────────────────────────────
export const analyzeSubjectCreditsWithAI = async (subject, studentContext) => {
  const groq = getGroqClient();

  const prompt = `You are an academic advisor AI. A student wants specific advice based on their performance in one subject.

STUDENT CONTEXT:
Department: ${studentContext.department || 'General'}
Degree: ${studentContext.degree || 'UG'}
Year: ${studentContext.year || 1}

SUBJECT DETAILS:
Subject Name: ${subject.name}
Subject Code: ${subject.code || 'N/A'}
Credits: ${subject.credits}
Marks Obtained: ${subject.marksObtained} / ${subject.maxMarks || 100}
Grade: ${subject.grade || 'N/A'}
Grade Points: ${subject.gradePoints || 'N/A'}
Status: ${subject.status || 'N/A'}

INSTRUCTIONS:
1. Briefly explain why ${subject.credits} credits in this subject matters for the student's overall GPA.
2. Evaluate the student's performance honestly.
3. Suggest 3-5 specific, actionable study strategies or free online resources for this subject.
4. Connect this subject's performance to 1-2 career paths where it's relevant.
5. Be encouraging but realistic.
6. Plain text only — no markdown. Use numbered lists where helpful.

Keep the total response under 220 words.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || "Advice unavailable.";
};
