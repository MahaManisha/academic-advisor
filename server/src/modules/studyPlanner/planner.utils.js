// server/src/modules/studyPlanner/planner.utils.js
export const calculatePriority = (skillLevel) => {
  if (skillLevel === "beginner") return 3;
  if (skillLevel === "intermediate") return 2;
  return 1;
};

export const estimateStudyTime = (level) => {
  if (level === "beginner") return 60;
  if (level === "intermediate") return 45;
  return 30;
};

export const detectBurnout = (missedTasksCount) => {
  return missedTasksCount >= 3;
};
