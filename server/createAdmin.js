import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/modules/user/user.model.js";

dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to Database
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI is missing in .env file");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const adminEmail = "admin@gmail.com";
        const adminPassword = "fake-password-change-me"; // Will be hashed
        const plainPassword = "12345678"; // The one user enters

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("⚠️ Admin user already exists:");
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);

            if (existingAdmin.role !== 'admin') {
                console.log("   Updating role to 'admin'...");
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log("✅ User role updated to admin.");
            } else {
                console.log("   Role is already admin. No changes made.");
            }

        } else {
            console.log("🔨 Creating new admin user...");

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(plainPassword, salt);

            const newAdmin = new User({
                fullName: "System Admin",
                email: adminEmail,
                passwordHash: passwordHash,
                role: "admin",
                status: "active"
            });

            await newAdmin.save();
            console.log("✅ Admin user created successfully!");
            console.log("-----------------------------------");
            console.log(`📧 Email:    ${adminEmail}`);
            console.log(`🔑 Password: ${plainPassword}`);
            console.log("-----------------------------------");
        }

        process.exit(0);

    } catch (error) {
        console.error("❌ Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
