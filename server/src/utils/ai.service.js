import { GoogleGenerativeAI } from "@google/generative-ai";

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

export const generateAssessmentFromContext = async (context) => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const systemPrompt = `
You are an Academic Assessment Generator powered by Retrieval-Augmented Generation (RAG).

You must STRICTLY use only the information provided in the retrieved context.
You are NOT allowed to use prior knowledge or make assumptions beyond the context.

Your role:
- Analyze the academic syllabus from the retrieved documents
- Generate a syllabus-aligned diagnostic assessment for the student
- Ensure all questions are directly traceable to the syllabus content

If required information is missing in the context:
- Clearly indicate what is missing
- Do NOT hallucinate or invent syllabus content

Output Format:
Return a JSON object with the following structure:
{
  "title": "Assessment Title",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Explanation citing the syllabus context"
    }
  ]
}
`;

    const result = await model.generateContent([
      systemPrompt,
      `Context: ${context}`,
      "Generate the assessment based on the above context."
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate assessment");
  }
};

export const generatePersonalizedAssessment = async (context, studentDetails) => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are an AI Academic Assessment Generator.

Your task is to generate a personalized assessment for a student based strictly on the provided syllabus content.

-----------------------------------------
STUDENT DETAILS
-----------------------------------------
College: ${studentDetails.college}
Degree: ${studentDetails.degree}
Year: ${studentDetails.year}
Department: ${studentDetails.department}
Current CGPA: ${studentDetails.cgpa}

Subject Proficiency Levels (1 = Beginner, 5 = Expert):
${JSON.stringify(studentDetails.proficiencyScores, null, 2)}

-----------------------------------------
SYLLABUS CONTENT
-----------------------------------------
${context}

-----------------------------------------
INSTRUCTIONS
-----------------------------------------

1. Analyze the syllabus carefully.
2. Identify core subjects relevant to the student’s year and department.
3. Adjust difficulty level based on:
   - Year of study
   - CGPA
   - Subject proficiency levels
4. Questions must strictly align with syllabus topics.
5. Avoid hallucinating topics not present in the syllabus.
6. Generate a balanced assessment.

-----------------------------------------
OUTPUT FORMAT (STRICT JSON ONLY)
-----------------------------------------

{
  "assessment_title": "string",
  "college": "string",
  "department": "string",
  "year": "number",
  "difficulty_level": "Beginner | Intermediate | Advanced",
  "sections": [
    {
      "section_name": "Core Concepts",
      "questions": [
        {
          "question_type": "MCQ",
          "question": "string",
          "options": ["A", "B", "C", "D"],
          "correct_answer": "string",
          "marks": 2
        }
      ]
    },
    {
      "section_name": "Analytical",
      "questions": [
        {
          "question_type": "Short Answer",
          "question": "string",
          "expected_answer": "string",
          "marks": 5
        }
      ]
    },
    {
      "section_name": "Coding",
      "questions": [
        {
          "question_type": "Coding",
          "question": "string",
          "constraints": "string",
          "marks": 10
        }
      ]
    }
  ],
  "total_marks": "number",
  "estimated_duration_minutes": "number"
}

Return ONLY valid JSON.
Do not include explanations.
Do not include markdown.
Do not include extra text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate personalized assessment");
  }
};

export const extractSubjectsFromContext = async (context) => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const systemPrompt = `
You are an Academic Parser.
Analyze the provided syllabus or academic context and extract the list of MAIN SUBJECTS or TOPICS.

Rules:
1. Return purely a JSON object with a key "subjects" which is an array of strings.
2. Limit to 6-8 main subjects.
3. Subject names should be concise (e.g., "Operating Systems", "Calculus").
4. Ignore minor sub-topics unless they are major modules.

Output Example:
{
  "subjects": ["Mathematics", "Physics", "Computer Science"]
}
`;
    const result = await model.generateContent([
      systemPrompt,
      `Context: ${context}`
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Subject Extraction Error:", error);
    return { subjects: ["Mathematics", "Science", "General Aptitude"] }; // Fallback
  }
};

export const extractRelevantSubjects = async (context, studentContext) => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are an academic curriculum analyzer.

Your task is to extract the core subjects relevant to a specific student based strictly on the provided syllabus.

-----------------------------------------
STUDENT CONTEXT
-----------------------------------------
Degree: ${studentContext.degree}
Department: ${studentContext.department}
Year: ${studentContext.year}

-----------------------------------------
SYLLABUS CONTENT
-----------------------------------------
${context}

-----------------------------------------
INSTRUCTIONS
-----------------------------------------

1. Carefully analyze the syllabus.
2. Identify subjects specifically relevant to the given department and year.
3. Exclude:
   - Subjects from other departments
   - Subjects from other years
   - Lab codes, credit numbers, or metadata
4. Return only core theory and important lab subjects.
5. Do NOT hallucinate subjects not present in syllabus.
6. If semester-wise subjects are listed, include only the semesters corresponding to the given year.
7. Return clean subject names only.

-----------------------------------------
OUTPUT FORMAT (STRICT JSON ONLY)
-----------------------------------------

{
  "year": "${studentContext.year}",
  "department": "${studentContext.department}",
  "subjects": [
    "Subject 1",
    "Subject 2",
    "Subject 3"
  ]
}

Return ONLY valid JSON.
Do not include explanations.
Do not include markdown.
Do not include extra text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Relevant Subject Extraction Error:", error);
    throw new Error("Failed to extract relevant subjects");
  }
};
