import mongoose from "mongoose";

const guildSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                role: {
                    type: String,
                    enum: ["member", "officer", "leader"],
                    default: "member",
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        xp: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 1,
        },
        weeklyMission: {
            title: { type: String, default: "Complete 10 Assessments" },
            target: { type: Number, default: 10 },
            progress: { type: Number, default: 0 },
            rewardXP: { type: Number, default: 500 },
        },
    },
    { timestamps: true }
);

export default mongoose.model("Guild", guildSchema);
