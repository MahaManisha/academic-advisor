import {
  generateStudyPlan,
  updateTaskStatus
} from "./studyPlanner.service.js";

export const generate = async (req, res, next) => {
  try {
    const plan = await generateStudyPlan(req.user.id, req.body.period);
    res.json({ success: true, plan });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const plan = await updateTaskStatus(
      req.params.planId,
      req.params.taskId,
      req.body.status
    );
    res.json({ success: true, plan });
  } catch (err) {
    next(err);
  }
};
