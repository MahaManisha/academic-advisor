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


        const adminEmail = "admin@gmail.com";
        const adminPassword = "fake-password-change-me"; // Will be hashed
        const plainPassword = "12345678"; // The one user enters

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {




            let updated = false;
            if (existingAdmin.role !== 'admin') {

                existingAdmin.role = 'admin';
                updated = true;
            }
            if (!existingAdmin.emailVerified) {

                existingAdmin.emailVerified = true;
                updated = true;
            }
            if (!existingAdmin.onboardingCompleted) {

                existingAdmin.onboardingCompleted = true;
                updated = true;
            }

            if (updated) {
                await existingAdmin.save();

            } else {

            }

        } else {


            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(plainPassword, salt);

            const newAdmin = new User({
                fullName: "System Admin",
                email: adminEmail,
                passwordHash: passwordHash,
                role: "admin",
                status: "active",
                emailVerified: true,
                onboardingCompleted: true
            });

            await newAdmin.save();





        }

        process.exit(0);

    } catch (error) {
        console.error("❌ Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
