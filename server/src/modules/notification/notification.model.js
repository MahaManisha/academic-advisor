import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        type: {
            type: String,
            enum: [
                "FRIEND_REQUEST",
                "FRIEND_ACCEPTED",
                "NEW_MESSAGE",
                "DEADLINE_REMINDER",
                "ASSESSMENT_READY",
                "SYSTEM_ALERT"
            ],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
