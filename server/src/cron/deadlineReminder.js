import cron from 'node-cron';
import User from '../modules/user/user.model.js';
import StudyPlan from '../modules/studyPlanner/studyPlan.model.js';
import { createNotification } from '../modules/notification/notification.controller.js';

export const initDeadlineCron = (io) => {
    // Run every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('Running deadline reminder cron job...');
        try {
            // Find all active study plans
            const activePlans = await StudyPlan.find({ active: true }).populate('userId');

            const now = new Date();
            const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Iterate over active plans to find tasks due within 24 hours
            for (const plan of activePlans) {
                if (!plan.userId) continue;

                const dueTasks = plan.tasks.filter(
                    task => task.status === 'pending' && task.dueDate && task.dueDate > now && task.dueDate <= in24Hours
                );

                if (dueTasks.length > 0) {
                    await createNotification({
                        recipient: plan.userId._id,
                        type: 'DEADLINE_REMINDER',
                        message: `⚠️ Quest Deadline Approaching! You have ${dueTasks.length} task(s) due in less than 24 hours.`,
                        relatedId: plan._id,
                        io
                    });
                }
            }

            console.log('Deadline reminder cron job completed successfully.');
        } catch (error) {
            console.error('Error running deadline reminder cron job:', error);
        }
    });
};
