import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/user/user.model.js';
import Course from './src/modules/course/course.model.js';

dotenv.config();

const checkDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const userCount = await User.countDocuments({});
    const studentCount = await User.countDocuments({ role: 'student' });
    const courseCount = await Course.countDocuments({});



    process.exit(0);
};

checkDB();
