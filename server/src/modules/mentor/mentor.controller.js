import * as mentorService from "./mentor.service.js";

export const generateAssessment = async (req, res, next) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ message: "Domain is required" });
    const assessment = await mentorService.generateAssessment(domain);
    res.status(200).json({ success: true, assessment });
  } catch (error) {
    next(error);
  }
};

export const evaluateAssessment = async (req, res, next) => {
  try {
    const { answers, questions } = req.body;
    const userId = req.user.id;
    const result = await mentorService.evaluateAssessment(userId, answers, questions);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getRankedMentors = async (req, res, next) => {
  try {
    const filters = { domain: req.query.domain };
    const mentors = await mentorService.getRankedMentors(filters);
    res.status(200).json({ success: true, mentors });
  } catch (error) {
    next(error);
  }
};

export const requestMentorship = async (req, res, next) => {
  try {
    const { mentorId, message } = req.body;
    const studentId = req.user.id;
    const request = await mentorService.requestMentorship(studentId, mentorId, message);
    res.status(201).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

export const getMentorRequests = async (req, res, next) => {
  try {
    // Note: the mentor's user ID is in req.user.id, but we need the mentor profile ID.
    // So let's fetch it or expect the route to resolve it
    const mentorProfile = await mentorService.getMentorDashboardStats(req.user.id);
    const requests = await mentorService.getMentorRequests(mentorProfile.mentor._id);
    res.status(200).json({ success: true, requests });
  } catch (error) {
    next(error);
  }
};

export const getMentorDashboard = async (req, res, next) => {
  try {
    const dashboard = await mentorService.getMentorDashboardStats(req.user.id);
    res.status(200).json({ success: true, dashboard });
  } catch (error) {
    next(error);
  }
};

export const respondToRequest = async (req, res, next) => {
  try {
    const { requestId, status } = req.body;
    const request = await mentorService.respondToRequest(requestId, status);
    res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

export const getMentorStudents = async (req, res, next) => {
  try {
    const mentorProfile = await mentorService.getMentorDashboardStats(req.user.id);
    const students = await mentorService.getMentorStudents(mentorProfile.mentor._id);
    res.status(200).json({ success: true, students });
  } catch (error) {
    next(error);
  }
};

export const submitFeedback = async (req, res, next) => {
  try {
    const { mentorId, rating, comment } = req.body;
    const studentId = req.user.id;
    const feedback = await mentorService.submitFeedback(studentId, mentorId, rating, comment);
    res.status(201).json({ success: true, feedback });
  } catch (error) {
    next(error);
  }
};
