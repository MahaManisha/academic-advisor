import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // Optional for backward compatibility with global courses
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        name: {
            type: String,
            trim: true
        },
        code: {
            type: String,
            trim: true,
            uppercase: true
        },
        description: {
            type: String,
            trim: true
        },
        thumbnail: { type: String },
        instructor: { type: String },
        duration: { type: String },
        videoUrl: { type: String },
        recommendationReason: { type: String },
        credits: {
            type: Number,
            default: 3
        },
        difficulty: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Intermediate'
        },
        category: {
            type: String,
            default: 'General'
        },
        status: {
            type: String,
            default: 'active'
        }
    },
    { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
