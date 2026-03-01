import Notification from "./notification.model.js";
import User from "../user/user.model.js";

// Helper to create & emit notification
export const createNotification = async ({ recipient, sender, type, message, relatedId, io }) => {
    try {
        // Check user preferences
        const user = await User.findById(recipient);
        if (!user) return null;

        if (user.notificationSettings) {
            if (
                (type === 'DEADLINE_REMINDER' && !user.notificationSettings.deadline) ||
                ((type === 'FRIEND_REQUEST' || type === 'FRIEND_ACCEPTED') && !user.notificationSettings.friendRequest) ||
                (type === 'NEW_MESSAGE' && !user.notificationSettings.message)
            ) {
                return null; // User disabled this type of notification
            }
        }

        const notification = await Notification.create({
            recipient,
            sender,
            type,
            message,
            relatedId
        });

        const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'fullName')
            .exec();

        // Emit if io is provided
        if (io) {
            io.to(recipient.toString()).emit("newNotification", populatedNotification);
        }

        return populatedNotification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

export const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .populate('sender', 'fullName');

        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
