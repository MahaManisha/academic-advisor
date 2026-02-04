import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../user/user.model.js";
import Otp from "./otp.model.js";
import { sendOtpEmail } from "../../utils/email.service.js"; // Mock email service

// Helper to generate 6 digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const registerUser = async (data) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw { status: 400, message: "Email already registered" };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  // 1. Create User with emailVerified: false
  const user = await User.create({
    fullName: data.fullName,
    email: data.email,
    passwordHash,
    role: data.role || "student",
    course: data.course,
    year: data.year,
    emailVerified: false, // CRITICAL: User cannot login yet
    profileCompleted: false,
    analyticsGenerated: false
  });

  // 2. Generate and Send OTP
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  await Otp.create({ email: user.email, otpHash });

  // 3. Send via Mock Email Service
  await sendOtpEmail(user.email, otp);

  return user;
};

export const verifyEmail = async (email, otp) => {
  // 1. Find OTP Record
  const otpRecord = await Otp.findOne({ email });
  if (!otpRecord) {
    throw { status: 400, message: "OTP expired or invalid. Please resend." };
  }

  // 2. Validate Hash
  const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isMatch) {
    throw { status: 400, message: "Invalid OTP. Please try again." };
  }

  // 3. Update User Status
  const user = await User.findOneAndUpdate(
    { email },
    { emailVerified: true },
    { new: true }
  );

  if (!user) {
    throw { status: 404, message: "User not found." };
  }

  // 4. Delete Used OTP
  await Otp.deleteOne({ _id: otpRecord._id });

  // 5. Generate Token (Auto-login)
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const userResponse = user.toObject ? user.toObject() : user;
  delete userResponse.passwordHash;

  return { token, user: userResponse };
};

export const resendOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  if (user.emailVerified) {
    throw { status: 400, message: "Email already verified. Please login." };
  }

  // Delete any existing OTPs for cleanliness
  await Otp.deleteMany({ email });

  // Generate and Send New OTP
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  await Otp.create({ email, otpHash });
  await sendOtpEmail(email, otp);

  return true;
};

export const loginUser = async (data) => {
  const user = await User.findOne({ email: data.email });
  if (!user) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const isMatch = await bcrypt.compare(data.password, user.passwordHash);
  if (!isMatch) {
    throw { status: 401, message: "Invalid credentials" };
  }

  // CRITICAL: Block Login if Not Verified
  if (user.emailVerified === false) {
    throw { status: 403, message: "Please verify your email to login." };
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const userResponse = user.toObject ? user.toObject() : user;
  delete userResponse.passwordHash;

  return { token, user: userResponse };
};
