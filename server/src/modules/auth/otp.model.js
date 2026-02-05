import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: false // Optional, used for temp user storage
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // 10 Minutes TTL
    },
});

otpSchema.index({ email: 1 });

export default mongoose.model("Otp", otpSchema);
