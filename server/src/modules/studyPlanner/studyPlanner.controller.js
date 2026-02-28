// server/src/modules/studyPlanner/studyPlanner.controller.js
import StudyPlan from "./studyPlan.model.js";
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

export const getTasks = async (req, res, next) => {
  try {
    const activePlan = await StudyPlan.findOne({
      userId: req.user.id || req.user.userId,
      active: true
    }).sort({ createdAt: -1 });

    if (!activePlan || !activePlan.tasks || activePlan.tasks.length === 0) {
      return res.json({ success: true, tasks: [], planId: null });
    }

    const formattedTasks = activePlan.tasks.map(task => ({
      id: task._id,
      title: task.title,
      subject: task.domain || "General",
      priority: "medium",
      dueDate: task.dueDate || new Date().toISOString(),
      duration: task.estimatedMinutes || 60,
      status: task.status || "pending",
      planId: activePlan._id
    }));

    res.json({ success: true, tasks: formattedTasks, planId: activePlan._id });
  } catch (err) {
    next(err);
  }
};
