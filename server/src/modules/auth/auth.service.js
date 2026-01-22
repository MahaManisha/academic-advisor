import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../user/user.model.js";

export const registerUser = async (data) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw { status: 400, message: "Email already registered" };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    fullName: data.fullName,
    email: data.email,
    passwordHash,
    role: data.role || "student"
  });

  return user;
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

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user };
};
