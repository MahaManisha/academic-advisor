import StudyPlan from "./studyPlan.model.js";
import StudentProfile from "../studentProfile/studentProfile.model.js";
import Recommendation from "../recommendation/recommendation.model.js";
import {
  calculatePriority,
  estimateStudyTime,
  detectBurnout
} from "./planner.utils.js";

export const generateStudyPlan = async (userId, period = "weekly") => {
  const profile = await StudentProfile.findOne({ userId });
  const recommendations = await Recommendation.find({ userId });

  if (!profile) return null;

  const tasks = [];

  for (const skill of profile.skills) {
    const minutes = estimateStudyTime(skill.level);

    tasks.push({
      title: `Practice ${skill.domain}`,
      domain: skill.domain,
      estimatedMinutes: minutes,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    });
  }

  // Deactivate old plans
  await StudyPlan.updateMany(
    { userId, active: true },
    { active: false }
  );

  return await StudyPlan.create({
    userId,
    period,
    tasks,
    performanceScore: 1
  });
};

export const updateTaskStatus = async (planId, taskId, status) => {
  const plan = await StudyPlan.findById(planId);

  const task = plan.tasks.id(taskId);
  task.status = status;

  const missedCount = plan.tasks.filter(
    t => t.status === "missed"
  ).length;

  if (detectBurnout(missedCount)) {
    plan.performanceScore *= 0.8;
  }

  await plan.save();
  return plan;
};
