// server/src/modules/onboarding/onboarding.prompt.js
export const SYSTEM_PROMPT = `You are an academic diagnostic AI. Your goal is to construct a comprehensive diagnostic test that identifies a student's conceptual depth in the selected domain, and then evaluate their performance to suggest their personalized learning path.`;

export const getDiagnosticTestPrompt = (retrievedChunks, domain, accessibilityPrefs = {}) => {
  let accessibilityInstructions = [];

  if (accessibilityPrefs.cognitiveMode === 'lowCognitiveLoad') {
    accessibilityInstructions.push("- Questions must be short and use simple words.");
    accessibilityInstructions.push("- No complex sentences.");
  }
  if (accessibilityPrefs.screenReaderOptimized === true) {
    accessibilityInstructions.push("- Avoid decorative symbols and structured formatting.");
  }
  if (accessibilityPrefs.audioSupport === true) {
    accessibilityInstructions.push("- Include a short summary version for audio.");
  }

  const actOnAccessibility = accessibilityInstructions.length > 0
    ? `\nACCESSIBILITY REQUIREMENTS:\n${accessibilityInstructions.join('\n')}\n`
    : "";

  return `
${SYSTEM_PROMPT}

CONTEXT:
${retrievedChunks}

DOMAIN: ${domain}
${actOnAccessibility}
INSTRUCTIONS:
1. Generate an array of exactly 15 multiple-choice questions based strictly on the Context and Domain.
2. The questions must adhere to this Structure of Mixed Difficulty:
   - 5 "Easy" questions testing basic concepts.
   - 5 "Medium" questions testing application.
   - 5 "Hard" questions testing problem-solving.
3. Keep the questions focused and analytical.
4. Return ONLY a JSON object with this exact format, without any markdown formatting or ticks:
{
  "questions": [
    {
      "id": 1,
      "question": "The actual question text",
      "options": ["A", "B", "C", "D"],
      "difficulty": "Easy", // or Medium, Hard
      "expectedConcept": "What conceptual understanding this question tests"${accessibilityPrefs.audioSupport ? ',\n      "summary": "Short summary text"' : ''}
    }
  ]
}
`;
};

export const getDiagnosticEvaluationPrompt = (domain, questions, studentAnswers) => `
You are an AI Grader evaluating a student's completed diagnostic test.

DOMAIN: ${domain}

QUESTIONS AND THE STUDENT'S ANSWERS:
${JSON.stringify({ questions, studentAnswers }, null, 2)}

INSTRUCTIONS:
1. Compare the student's answers with the expected conceptual truths in the domain.
2. Give a conceptual accuracy score between 0.0 and 1.0.
3. Identify their strong areas and weak areas.
4. Crucially, based on their performance, suggest exactly 3 Career Goals, exactly 1 Learning Style out of ["Visual", "Auditory", "Reading/Writing", "Kinesthetic"], and exactly 5 academic Interests they should focus on.
5. Return ONLY a JSON object with this exact format, without any markdown formatting or ticks:
{
  "score": 0.85,
  "conceptStrength": "Brief summary of what they excel at",
  "weaknesses": ["Topic 1", "Topic 2"],
  "suggestedInterests": ["Interest 1", "Interest 2", "Interest 3", "Interest 4", "Interest 5"],
  "suggestedCareerGoals": ["Goal 1", "Goal 2", "Goal 3"],
  "suggestedLearningStyle": "Visual" // must be one of the specified styles
}
`;

