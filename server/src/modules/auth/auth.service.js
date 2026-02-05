import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../user/user.model.js";
import Otp from "./otp.model.js";
import { sendOtpEmail } from "../../utils/email.service.js";

// Helper to generate 6 digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Initiate Registration (Step 1)
export const registerUser = async (data) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw { status: 400, message: "Email already registered" };
  }

  // Generate OTP
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  // Store in OTP collection (Temporary User Data)
  // We overwrite any existing OTP for this email
  await Otp.deleteMany({ email: data.email });

  await Otp.create({
    email: data.email,
    otpHash,
    fullName: data.fullName // Store name temporarily here
  });

  // Send Email
  await sendOtpEmail(data.email, otp);

  return { email: data.email };
};

// 2. Verify Email (Step 2)
export const verifyEmail = async (email, otp) => {
  const otpRecord = await Otp.findOne({ email });
  if (!otpRecord) {
    throw { status: 400, message: "OTP expired or invalid." };
  }

  const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isMatch) {
    throw { status: 400, message: "Invalid OTP." };
  }

  // Return success (Frontend will now allow moving to Step 3)
  // We keep the OTP record to verify again during completion or rely on a signed token?
  // Better: We return a temporary "registration token" that proves email was verified.
  // OR simpler: We keep the OTP record but mark it as 'verified' or just trust the frontend? 
  // Trusting frontend is bad security.
  // Secure way: Issue a temporary JWT with scope 'registration'.

  const registrationToken = jwt.sign(
    { email, fullName: otpRecord.fullName, scope: 'registration' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { success: true, registrationToken };
};

// 3. Complete Registration (Step 4)
export const completeRegistration = async (data) => {
  // data: { registrationToken, password, academicStatus, ...details }

  // Verify Token
  let decoded;
  try {
    decoded = jwt.verify(data.registrationToken, process.env.JWT_SECRET);
    if (decoded.scope !== 'registration') throw new Error('Invalid token scope');
  } catch (e) {
    throw { status: 401, message: "Session expired. Please verify email again." };
  }

  const { email, fullName } = decoded;

  // Double check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) throw { status: 400, message: "User already registered." };

  const passwordHash = await bcrypt.hash(data.password, 10);

  // Create User
  const user = await User.create({
    fullName,
    email,
    passwordHash,
    role: "student",
    emailVerified: true,
    academicStatus: data.academicStatus,

    // Status Specific Fields
    // 1. School
    schoolName: data.schoolName,
    educationBoard: data.educationBoard,
    standard: data.standard,
    medium: data.medium,

    // 2. College
    college: data.college,
    degreeType: data.degreeType,
    domain: data.domain,
    year: data.year ? Number(data.year) : undefined,
    areaOfInterest: data.areaOfInterest, // Array

    // 3. Graduated
    qualification: data.qualification,
    fieldOfStudy: data.fieldOfStudy,
    skills: data.skills, // Array
    careerInterest: data.careerInterest,
    learningDomain: data.learningDomain,

    course: data.domain || data.learningDomain || data.fieldOfStudy, // Unified field

    profileCompleted: false,
    onboardingCompleted: false
  });

  // Cleanup OTPs
  await Otp.deleteMany({ email });

  // Login Token
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const userResponse = user.toObject();
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
    {
      userId: user._id,
      role: user.role,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const userResponse = user.toObject ? user.toObject() : user;
  delete userResponse.passwordHash;

  return { token, user: userResponse };
};
