import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/modules/user/user.model.js";

dotenv.config();

const resetPassword = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI is missing");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const adminEmail = "admin@gmail.com";
        const newPassword = "12345678";

        const user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.log("❌ Admin user not found. Run createAdmin.js first.");
        } else {
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(newPassword, salt);
            await user.save();
            console.log(`✅ Password for ${adminEmail} has been reset to: ${newPassword}`);
        }

        process.exit(0);

    } catch (error) {
        console.error("❌ Error resetting password:", error);
        process.exit(1);
    }
};

resetPassword();
