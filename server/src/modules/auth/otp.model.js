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
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // 10 Minutes TTL
    },
});

otpSchema.index({ email: 1 });

export default mongoose.model("Otp", otpSchema);
