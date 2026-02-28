// server/src/modules/onboarding/onboarding.prompt.js
export const SYSTEM_PROMPT = `You are an academic diagnostic AI. Your goal is to identify the student's conceptual depth in the selected domain. Use the retrieved syllabus context to generate domain-specific questions.`;

export const getQuestionGenerationPrompt = (retrievedChunks, previousAnalysis, difficultyLevel, domain, accessibilityPrefs = {}) => {
  let accessibilityInstructions = [];

  if (accessibilityPrefs.cognitiveMode === 'lowCognitiveLoad') {
    accessibilityInstructions.push("- Questions must be shorter");
    accessibilityInstructions.push("- No complex sentences");
    accessibilityInstructions.push("- Use simple words");
  }

  if (accessibilityPrefs.screenReaderOptimized === true) {
    accessibilityInstructions.push("- Avoid emojis");
    accessibilityInstructions.push("- Avoid decorative symbols");
    accessibilityInstructions.push("- Use structured formatting");
  }

  if (accessibilityPrefs.audioSupport === true) {
    accessibilityInstructions.push("- Include short summary version");
  }

  const actOnAccessibility = accessibilityInstructions.length > 0
    ? `\nACCESSIBILITY REQUIREMENTS:\n${accessibilityInstructions.join('\n')}\n`
    : "";

  return `
${SYSTEM_PROMPT}

CONTEXT:
${retrievedChunks}

PREVIOUS ANSWER ANALYSIS (If any):
${previousAnalysis ? JSON.stringify(previousAnalysis) : "None. This is the first question."}

DOMAIN: ${domain}
TARGET DIFFICULTY: ${difficultyLevel} (Scale 1-5)
${actOnAccessibility}
INSTRUCTIONS:
1. Generate ONE multiple-choice or short-answer question strictly based on the Context provided.
2. The question must match the TARGET DIFFICULTY.
3. If previous answers show weakness, focus the question on foundational concepts.
4. Keep the question concept-focused and analytical, avoiding mere definitions.
5. Return ONLY a JSON object with this exact format, without any markdown formatting or ticks:
{
  "question": "The actual question text",
  "options": ["A", "B", "C", "D"], // Include only if MCQ, otherwise null
  "expectedConcept": "What conceptual understanding this question tests",
  "difficulty": ${difficultyLevel}${accessibilityPrefs.audioSupport ? ',\n  "summary": "Short summary version of the question"' : ''}
}
`;
};

export const getAnswerEvaluationPrompt = (retrievedChunks, question, studentAnswer) => `
You are an AI Grader evaluating a student's answer based on the provided context.

CONTEXT:
${retrievedChunks}

QUESTION ASKED:
${JSON.stringify(question)}

STUDENT'S ANSWER:
${studentAnswer}

INSTRUCTIONS:
1. Compare the student_answer with the context and the required expectedConcept.
2. Give a conceptual accuracy score between 0.0 and 1.0 (where 1.0 is perfectly correct).
3. Identify weak concepts if the score is low.
4. Return ONLY a JSON object with this exact format, without any markdown formatting or ticks:
{
  "score": 0.8,
  "conceptStrength": "Explains what the student understands well",
  "weaknesses": ["list", "of", "weak", "topics"],
  "suggestedDifficultyAdjustment": 1 // +1 to increase difficulty, -1 to decrease, 0 to keep same
}
`;
