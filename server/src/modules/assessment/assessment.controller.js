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
