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
4. Based on the credit-heavy subjects and high grades, identify the student's "EXPERT DOMAIN" (e.g., Mathematical Analysis, Software Development, Theoretical Physics, etc.).
5. Highlight this EXPERT DOMAIN clearly at the top.
6. Give motivational but realistic advice.
7. Structure the response with clearly labeled sections:
   - EXPERT DOMAIN: (One short phrase)
   - STRENGTHS:
   - WEAK AREAS:
   - IMPROVEMENT PLAN:
   - LEARNING SUGGESTIONS:
   - CAREER SUGGESTIONS:
8. Plain text only — no markdown asterisks or hashtags. Use CAPS for section headings.

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

// ─── Extract structured marksheet data from an Image ────────────────────────
export const extractMarksheetFromImageWithAI = async (base64Image) => {
  const groq = getGroqClient();

  const prompt = `You are an OCR and data extraction AI. An image of a student's marksheet/grade sheet is provided.
Extract the relevant data and return it ONLY as a valid JSON object.
IMPORTANT: For each subject, try your absolute best to identify the CREDITS. If not explicitly found, estimate them based on common university standards (usually 2, 3, or 4).
If you cannot find a value at all, use 3 as a safe default for theory subjects.

JSON SCHEMA:
{
  "semester": "String (e.g. 'Semester 3' or 'Term 2', guess if missing)",
  "year": "String (e.g. '2024-2025', guess if missing)",
  "cgpa": "Number or string of the cumulative GPA if present, otherwise empty string",
  "sgpa": "Number or string of the semester GPA if present, otherwise empty string",
  "totalCredits": "Number or string (total credits for the semester)",
  "creditsEarned": "Number or string (credits successfully earned)",
  "subjects": [
    {
      "name": "String (subject name)",
      "code": "String (subject code if available, else empty)",
      "credits": "Number (estimate if not clear, do not use null)",
      "marksObtained": "Number (marks or score obtained)",
      "maxMarks": "Number (maximum marks for the subject, default 100)",
      "grade": "String (e.g., 'O', 'A+', 'B', 'P', 'F', whatever is on the sheet)",
      "gradePoints": "Number (grade points earned, e.g. 9.0)",
      "status": "String ('Pass', 'Fail', or 'Absent')"
    }
  ]
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.2-11b-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: base64Image
            }
          }
        ]
      }
    ],
    temperature: 0.1,
  });

  const rawJson = completion.choices[0]?.message?.content || "{}";
  console.log("AI VISION RAW OUTPUT:", rawJson);

  try {
    const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI did not return a valid JSON object.");
    return JSON.parse(jsonMatch[0].trim());
  } catch (err) {
    console.error("Failed to parse AI vision output:", rawJson);
    console.error("Parse Error Details:", err.message);
    throw new Error("Failed to extract data from image.");
  }
};

// ─── Extract structured marksheet data from PDF Text ────────────────────────
export const extractMarksheetFromPdfTextWithAI = async (text) => {
  const groq = getGroqClient();

  // Sanitize text: remove control characters and non-printable chars that might break AI
  const cleanText = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "").trim();

  const prompt = `You are a data extraction AI. Extract mark/grade data from the following text of a student's marksheet and return it ONLY as a valid JSON object.
  
TEXT CONTENT:
${cleanText.substring(0, 15000)} // Limit to 15k chars for safety

JSON SCHEMA:
{
  "semester": "String",
  "year": "String",
  "cgpa": "Number/String",
  "sgpa": "Number/String",
  "totalCredits": "Number/String",
  "creditsEarned": "Number/String",
  "subjects": [
    {
      "name": "String",
      "code": "String",
      "credits": "Number",
      "marksObtained": "Number",
      "maxMarks": "Number",
      "grade": "String",
      "gradePoints": "Number",
      "status": "String"
    }
  ]
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
  });

  const rawJson = completion.choices[0]?.message?.content || "{}";
  console.log("AI PDF TEXT RAW OUTPUT:", rawJson);

  try {
    const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI did not return a valid JSON object.");
    return JSON.parse(jsonMatch[0].trim());
  } catch (err) {
    console.error("Failed to parse AI PDF output:", rawJson);
    throw new Error("Failed to extract data from PDF.");
  }
};
