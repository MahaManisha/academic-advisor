// server/src/modules/assessment/assessment.service.js
import Question from "./question.model.js";
import AssessmentAttempt from "./assessmentAttempt.model.js";
import StudentProfile from "../studentProfile/studentProfile.model.js";

export const startAssessment = async (domain) => {
  // Start with medium difficulty
  return await Question.find({ domain, difficulty: 3 }).limit(5);
};

export const submitAssessment = async (userId, domain, answers) => {
  let correctCount = 0;

  answers.forEach(a => {
    if (a.isCorrect) correctCount++;
  });

  const score = correctCount;
  const accuracy = (correctCount / answers.length) * 100;

  let inferredLevel = "beginner";
  if (accuracy > 80) inferredLevel = "advanced";
  else if (accuracy > 50) inferredLevel = "intermediate";

  // Save attempt
  await AssessmentAttempt.create({
    userId,
    domain,
    answers,
    score,
    accuracy,
    inferredLevel,
    completedAt: new Date()
  });

  // Update student profile skill
  await StudentProfile.findOneAndUpdate(
    { userId },
    {
      lastAssessmentAt: new Date(),
      $set: {
        "skills.$[skill].level": inferredLevel
      }
    },
    {
      arrayFilters: [{ "skill.domain": domain }],
      new: true
    }
  );

  return { score, accuracy, inferredLevel };
};
