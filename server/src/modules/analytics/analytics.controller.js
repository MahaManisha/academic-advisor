// server/src/modules/analytics/analytics.controller.js
import { generateAnalytics } from "./analytics.service.js";
import Analytics from "./analytics.model.js";

export const generate = async (req, res, next) => {
  try {
    const data = await generateAnalytics(
      req.user.id,
      req.params.domain
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const data = await Analytics.find({
      userId: req.user.id
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// Admin Dashboard Analytics
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    // Dynamic import to avoid circular dependency issues if any,
    // though distinct module imports are usually fine.
    const User = (await import("../user/user.model.js")).default;

    // 1. KPI Stats
    const totalUsers = await User.countDocuments({ role: 'student' });
    const activeUsers = await User.countDocuments({ role: 'student', status: 'active' });

    // 2. User Growth (Last 6 months)
    const userGrowth = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);

    // 3. Course Distribution
    // Use Course model if possible to get total courses count
    // But distribution is about students per course.

    // Total Courses (Available in system) - Fix for "Total Courses" KPI
    // We need to import Course model dynamically or add it to imports
    const Course = (await import("../course/course.model.js")).default;
    const totalCourses = await Course.countDocuments({ status: 'active' });

    const courseDistribution = await User.aggregate([
      { $match: { role: 'student', course: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$course",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 4. Onboarding Funnel (Simple)
    const onboardingStats = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ["$onboardingCompleted", 1, 0] } }
        }
      }
    ]);

    const funnel = onboardingStats.length ? {
      total: onboardingStats[0].total,
      completed: onboardingStats[0].completed,
      pending: onboardingStats[0].total - onboardingStats[0].completed
    } : { total: 0, completed: 0, pending: 0 };


    res.json({
      success: true,
      data: {
        kpi: {
          totalUsers,
          activeUsers,
          onboardingRate: totalUsers > 0 ? Math.round((funnel.completed / totalUsers) * 100) : 0,
          totalCourses: totalCourses // NOW USING REAL COURSE COUNT
        },
        charts: {
          userGrowth: userGrowth.map(g => ({ date: g._id, users: g.count })),
          courseDistribution: courseDistribution.map(c => ({ name: c._id || 'Unassigned', value: c.count })),
          onboardingFunnel: [
            { name: 'Completed', value: funnel.completed },
            { name: 'Pending', value: funnel.pending }
          ]
        }
      }
    });

  } catch (err) {
    next(err);
  }
};
