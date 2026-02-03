import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        code: {
            type: String,
            required: true,
            trim: true, // e.g., 'CS101'
            uppercase: true
        },
        description: {
            type: String,
            trim: true
        },
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
            type: String, // e.g., 'Computer Science', 'Mathematics'
            required: true
        },
        status: {
            type: String, // 'active', 'archived'
            default: 'active'
        }
    },
    { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
