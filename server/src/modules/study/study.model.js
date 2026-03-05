import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: false
    },
    totalStudyTime: {
        type: Number,
        default: 0
    },
    focusedTime: {
        type: Number,
        default: 0
    },
    distractions: {
        type: Number,
        default: 0
    },
    xpEarned: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("StudySession", studySessionSchema);
