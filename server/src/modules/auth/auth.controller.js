// server/src/modules/auth/auth.controller.js
import { registerUser, loginUser, verifyEmail, resendOtp } from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    // Explicitly return success and email to facilitate OTP flow on frontend
    res.status(201).json({
      success: true,
      user: { email: user.email },
      message: "Registration successful. Please check your email for OTP."
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const verify = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyEmail(email, otp);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const resend = async (req, res, next) => {
  try {
    const { email } = req.body;
    await resendOtp(email);
    res.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    next(err);
  }
};
