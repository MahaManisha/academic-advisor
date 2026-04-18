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
1. Generate an array of exactly 15 standardized, high-quality multiple-choice questions for the specified Domain. Use the Context as a baseline, but use your comprehensive trained knowledge to ensure these are standard domain-specific questions (not basic or generic).
2. The questions must adhere to this Structure of Mixed Difficulty:
   - 5 "Easy" questions testing basic, foundational concepts.
   - 5 "Medium" questions testing intermediate application.
   - 5 "Hard" questions testing advanced problem-solving and deep conceptual understanding.
3. Keep the questions highly relevant to the specific domain.
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

export const getGenerateOnboardingOptionsPrompt = (domain) => `
You are an Academic Advisor AI. A student specializing in the domain "${domain}" is currently onboarding onto the platform.
We need to present them with standard, highly relevant Interests and Career Goals to choose from.

INSTRUCTIONS:
1. Generate a list of exactly 12 standard "Interests" (academic/professional areas) that are highly relevant to ${domain}.
2. Generate a list of exactly 8 standard "Career Goals" (job roles/titles) that are strongly associated with ${domain}.
3. The options must NOT be generic IT/Computer Science unless the domain is IT/Computer Science.
4. Return ONLY a JSON object with this exact format, without any markdown formatting or ticks:
{
  "interests": ["Interest 1", "Interest 2", "Interest 3", "Interest 4", "Interest 5", "Interest 6", "Interest 7", "Interest 8", "Interest 9", "Interest 10", "Interest 11", "Interest 12"],
  "careerGoals": ["Goal 1", "Goal 2", "Goal 3", "Goal 4", "Goal 5", "Goal 6", "Goal 7", "Goal 8"]
}
`;
