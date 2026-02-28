import {
  startAssessment,
  submitAssessment
} from "./assessment.service.js";
import { generateAssessmentFromContext, generatePersonalizedAssessment } from "../../utils/ai.service.js";

import { scrapeSyllabus } from "../../utils/scrape.service.js"; // Import new scraper

import User from "../user/user.model.js";
import StudentProfile from "../studentProfile/studentProfile.model.js";
import AssessmentAttempt from "./assessmentAttempt.model.js";

export const generate = async (req, res, next) => {
  try {
    const { context, url } = req.body;
    let finalContext = context;

    // Fetch User and StudentProfile
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const studentProfile = await StudentProfile.findOne({ userId: req.user.id });

    // Prepare Student Details
    const studentDetails = {
      college: user.college || "Unknown College",
      degree: user.degreeType || "Unknown Degree",
      year: user.year || 1,
      department: user.domain || user.course || "General",
      cgpa: "Not Provided", // Placeholder as CGPA is not explicitly stored
      proficiencyScores: {}
    };

    if (studentProfile && studentProfile.skills) {
      studentProfile.skills.forEach(skill => {
        let score = 1;
        if (skill.level === "intermediate") score = 3;
        if (skill.level === "advanced") score = 5;
        studentDetails.proficiencyScores[skill.domain] = score;
      });
    }

    if (url || user.syllabusUrl) {
      try {
        const targetUrl = url || user.syllabusUrl;
        if (targetUrl) {
          // If URL provided, scrape it
          finalContext = await scrapeSyllabus(targetUrl);
        }
      } catch (scrapeErr) {
        console.warn("Scraping failed, falling back to provided context or empty:", scrapeErr.message);
        // Don't fail completely if scrape fails, maybe context was provided?
        if (!finalContext) {
          return res.status(400).json({ message: "Failed to scrape syllabus and no context provided." });
        }
      }
    }

    if (!finalContext || !finalContext.trim()) {
      return res.status(400).json({ message: "Context or valid Syllabus URL is required" });
    }

    // Use personalized generation
    const assessment = await generatePersonalizedAssessment(finalContext, studentDetails);
    res.json({ success: true, assessment });
  } catch (err) {
    next(err);
  }
};



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

export const getAllAssessments = async (req, res, next) => {
  try {
    const attempts = await AssessmentAttempt.find({
      userId: req.user.id || req.user.userId
    }).sort({ createdAt: -1 });

    if (!attempts || attempts.length === 0) {
      return res.json({ success: true, assessments: [] });
    }

    const formattedAssessments = attempts.map(attempt => ({
      id: attempt._id,
      title: `${attempt.domain || 'Domain'} Assessment`,
      subject: attempt.domain || 'General',
      description: `Adaptive assessment for ${attempt.domain || 'General Topics'}`,
      questions: attempt.answers ? attempt.answers.length : 0,
      duration: 'Flexible',
      status: 'completed',
      dueDate: attempt.createdAt ? attempt.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      difficulty: attempt.inferredLevel || 'Medium',
      points: attempt.score ? attempt.score * 10 : 100,
      yourScore: attempt.accuracy ? Math.round(attempt.accuracy) : (attempt.score || 0)
    }));

    res.json({ success: true, assessments: formattedAssessments });
  } catch (err) {
    next(err);
  }
};
