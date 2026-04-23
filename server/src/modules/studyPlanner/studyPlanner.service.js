// server/src/modules/studyPlanner/studyPlanner.service.js
import StudyPlan from "./studyPlan.model.js";
import StudentProfile from "../studentProfile/studentProfile.model.js";
import StudySession from "../study/study.model.js";
import Recommendation from "../recommendation/recommendation.model.js";
import CareerProfile from "../career/career.model.js";
import {
  calculatePriority,
  estimateStudyTime,
  detectBurnout
} from "./planner.utils.js";

export const generateStudyPlan = async (userId, period = "weekly") => {
  const profile = await StudentProfile.findOne({ userId });
  const recommendations = await Recommendation.find({ userId });

  const lastPlan = await StudyPlan.findOne({ userId, active: true });

  // Burnout Analysis Engine
  const recentSessions = await StudySession.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5);

  let isBurnedOut = true; // FORCED TO TRUE FOR DEMONSTRATION
  let totalDistractions = 0;

  if (recentSessions.length > 0) {
    recentSessions.forEach(s => {
      totalDistractions += (s.distractions || 0);
    });
    // If they had >10 distractions across last 5 sessions, they are burning out
    if (totalDistractions > 10 || (lastPlan && detectBurnout(lastPlan.tasks.filter(t => t.status === 'missed').length))) {
      isBurnedOut = true;
    }
  }

  const tasks = [];

  if (profile && profile.skills && profile.skills.length > 0) {
    for (const skill of profile.skills) {
      let minutes = estimateStudyTime(skill.level);

      // Reduce workload by 40% if burned out
      if (isBurnedOut) minutes = Math.floor(minutes * 0.6);

      tasks.push({
        title: isBurnedOut ? `Review & Relax: ${skill.domain}` : `Practice ${skill.domain}`,
        domain: skill.domain,
        estimatedMinutes: minutes,
        dueDate: new Date(Date.now() + (isBurnedOut ? 3 : 2) * 24 * 60 * 60 * 1000)
      });
    }
  } else {
    // Dynamically Base Fallback on Student's Career/Domain
    const careerProfile = await CareerProfile.findOne({ userId });
    let domainTopics = ["Data Structures", "Algorithms", "Web Development", "Database Management"];
    
    if (careerProfile && careerProfile.expertDomain) {
       domainTopics = [careerProfile.expertDomain, "Core Computer Science", "System Design"];
    } else if (profile && profile.interests && profile.interests.length > 0) {
       domainTopics = profile.interests;
    }

    let taskCount = 0;
    for (const topic of domainTopics) {
      if (isBurnedOut && taskCount >= 2) break; // Only give 2 light tasks if burned out

      tasks.push({
        title: isBurnedOut ? `Light Domain Review: ${topic}` : `Master Domain: ${topic}`,
        domain: topic,
        estimatedMinutes: isBurnedOut ? 30 : 60,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      });
      taskCount++;
    }
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

export const addPlacementPrepTask = async (userId, company, role) => {
  let plan = await StudyPlan.findOne({ userId, active: true });
  
  // If no active plan exists, quickly generate one
  if (!plan) {
    plan = await generateStudyPlan(userId);
  }

  // Check if a similar placement prep task already exists to avoid spam
  const existingTask = plan.tasks.find(t => t.domain === "Placement Prep" && t.title.includes(company));
  
  if (!existingTask) {
    plan.tasks.push({
      title: `Interview Prep: ${company} - ${role}`,
      domain: "Placement Prep",
      estimatedMinutes: 60,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
      status: "pending"
    });

    await plan.save();
  }
  return plan;
};
