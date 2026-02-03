// server/src/modules/assessment/assessment.controller.js
import {
  startAssessment,
  submitAssessment
} from "./assessment.service.js";

export const start = async (req, res, next) => {
  try {
    const questions = await startAssessment(req.params.domain);
    res.json({ success: true, questions });
  } catch (err) {
    next(err);
  }
};

export const submit = async (req, res, next) => {
  try {
    const result = await submitAssessment(
      req.user.id,
      req.params.domain,
      req.body.answers
    );
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
};

export const getOnboardingQuestions = async (req, res, next) => {
  try {
    const user = await import("../user/user.model.js").then(m => m.default.findById(req.user.userId)); // Dynamic import to avoid circular dep if any
    if (!user) return res.status(404).json({ message: "User not found" });

    // Map course to domain
    const courseMap = {
      "Computer Science": "Computer Science",
      "Information Technology": "Computer Science",
      "Electronics Engineering": "Electronics Engineering",
      "Mechanical Engineering": "Mechanical Engineering",
      "Civil Engineering": "Civil Engineering"
    };

    const domain = courseMap[user.course] || "Computer Science"; // Default to CS if unknown

    const questions = await import("./question.model.js").then(m =>
      m.default.aggregate([
        { $match: { domain: domain } },
        { $sample: { size: 10 } } // Get 10 random questions
      ])
    );

    res.json({ success: true, questions, domain });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
