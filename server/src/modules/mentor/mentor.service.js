import Mentor from "./mentor.model.js";
import Feedback from "./feedback.model.js";
import MentorRequest from "./request.model.js";
import User from "../user/user.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

export const generateAssessment = async (domain) => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are an expert AI Assessment Generator for evaluating Mentors on an EdTech platform.
Generate a domain-specific onboarding assessment for a mentor in the domain: ${domain}

The assessment should have 5 mixed-difficulty questions (easy to advanced).
Include both conceptual MCQs and scenario-based questions.

Return purely a JSON object with this structure:
{
  "title": "Mentor Onboarding Assessment: ${domain}",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    }
  ]
}
Return ONLY valid JSON.
Do not include markdown.
Do not include extra text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("AI returned invalid JSON:", cleanedText);
      throw new Error("Invalid JSON format");
    }
  } catch (error) {
    console.error("AI Mentor Assessment Generation Error:", error);
    // Fallback assessment so the flow is not blocked for the user
    return {
      title: `Mentor Onboarding Assessment: ${domain}`,
      questions: [
        {
          question: "What is the primary role of a mentor?",
          options: ["To do the student's work", "To guide and advise", "To grade exams", "To write code"],
          correctAnswer: "To guide and advise"
        },
        {
          question: `In ${domain}, how do you approach a student who is struggling with a basic concept?`,
          options: ["Tell them to drop the course", "Give them the final answer", "Break it down into smaller, manageable parts", "Ignore them until they figure it out"],
          correctAnswer: "Break it down into smaller, manageable parts"
        },
        {
          question: "Which of the following is considered best practice for giving feedback?",
          options: ["Only point out mistakes", "Wait until the end of the year", "Be specific, constructive, and timely", "Compare them to other students"],
          correctAnswer: "Be specific, constructive, and timely"
        }
      ]
    };
  }
};

export const evaluateAssessment = async (userId, answers, questions) => {
  let score = 0;
  questions.forEach((q, index) => {
    if (answers[index] === q.correctAnswer) {
      score += 1;
    }
  });

  const rating = (score / questions.length) * 5;

  const mentor = await Mentor.findOne({ userId });
  if (mentor) {
    mentor.onboardingScore = score;
    mentor.rating = rating;
    mentor.status = rating >= 3 ? "approved" : "pending";
    await mentor.save();
  }

  // Set onboardingCompleted to true on the User object
  await User.findByIdAndUpdate(userId, { onboardingCompleted: true });

  return { score, rating, status: mentor?.status };
};

export const getRankedMentors = async (studentId, filters = {}) => {
  const query = { status: "approved" };
  if (filters.domain) {
    query.domain = { $regex: new RegExp(filters.domain, "i") };
  }

  const mentors = await Mentor.find(query)
    .populate("userId", "fullName email")
    .sort({ rating: -1, experience: -1 });

  // Get current student's requests to show connection status
  const studentRequests = await MentorRequest.find({ studentId });
  const requestMap = new Map(studentRequests.map(r => [r.mentorId.toString(), r.status]));

  return mentors.map((m) => ({
    id: m._id,
    userId: m.userId._id,
    name: m.userId.fullName,
    domain: m.domain,
    skills: m.skills,
    experience: m.experience,
    rating: m.rating,
    totalSessions: m.totalSessions,
    connectionStatus: requestMap.get(m._id.toString()) || "none"
  }));
};

export const requestMentorship = async (studentId, mentorId, message) => {
  const existingRequest = await MentorRequest.findOne({ studentId, mentorId, status: "pending" });
  if (existingRequest) {
    throw new Error("Mentorship request already pending");
  }

  const request = await MentorRequest.create({
    studentId,
    mentorId,
    message
  });

  return request;
};

export const getMentorRequests = async (mentorId) => {
  return await MentorRequest.find({ mentorId, status: "pending" })
    .populate("studentId", "fullName email course")
    .sort({ createdAt: -1 });
};

export const respondToRequest = async (requestId, status) => {
  const request = await MentorRequest.findById(requestId);
  if (!request) throw new Error("Request not found");
  
  request.status = status; // "accepted" or "rejected"
  await request.save();

  if (status === "accepted") {
    // Optionally create a chat channel or notification here
  }

  return request;
};

export const getMentorStudents = async (mentorId) => {
  // Students whose requests have been accepted
  const requests = await MentorRequest.find({ mentorId, status: "accepted" })
    .populate("studentId", "fullName email course avatar");
  
  return requests.map(req => ({
    ...req.studentId.toObject(),
    requestId: req._id,
    status: 'Active', // Mock active status
    connectedAt: req.updatedAt
  }));
};

export const removeStudent = async (requestId) => {
  const request = await MentorRequest.findByIdAndDelete(requestId);
  if (!request) throw new Error("Connection not found");
  return request;
};

export const getStudentMentors = async (studentId) => {
  // Mentors whose requests from this student have been accepted
  const requests = await MentorRequest.find({ studentId, status: "accepted" })
    .populate({
      path: "mentorId",
      populate: { path: "userId", select: "fullName email avatar" }
    });
  
  return requests.map(req => ({
    ...req.mentorId.userId.toObject(),
    mentorProfileId: req.mentorId._id,
    domain: req.mentorId.domain,
    requestId: req._id,
    status: 'Active',
    connectedAt: req.updatedAt
  }));
};

export const getMentorDashboardStats = async (userId) => {
  const mentor = await Mentor.findOne({ userId });
  if (!mentor) throw new Error("Mentor profile not found");

  const pendingRequests = await MentorRequest.countDocuments({ mentorId: mentor._id, status: "pending" });
  const totalStudents = await MentorRequest.countDocuments({ mentorId: mentor._id, status: "accepted" });

  return {
    mentor,
    stats: {
      pendingRequests,
      totalStudents,
      rating: mentor.rating,
      totalSessions: mentor.totalSessions
    }
  };
};

export const submitFeedback = async (studentId, mentorId, rating, comment) => {
  const feedback = await Feedback.create({ studentId, mentorId, rating, comment });
  
  const mentor = await Mentor.findById(mentorId);
  if (mentor) {
    mentor.feedbackScores.push(rating);
    
    // Update dynamic rating: (0.6 * onboarding_score) + (0.4 * average_student_feedback)
    const avgFeedback = mentor.feedbackScores.reduce((a, b) => a + b, 0) / mentor.feedbackScores.length;
    // Normalize onboarding score (assuming out of 5 originally)
    const onboardingNormalized = (mentor.onboardingScore / 5) * 5; // if out of 5 questions
    mentor.rating = (0.6 * onboardingNormalized) + (0.4 * avgFeedback);
    mentor.totalSessions += 1;
    await mentor.save();
  }

  return feedback;
};
