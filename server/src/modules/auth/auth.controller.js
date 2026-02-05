// server/src/modules/auth/auth.controller.js
import { registerUser, loginUser, verifyEmail, resendOtp, completeRegistration } from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    const response = await registerUser(req.body);
    // Explicitly return success and email to facilitate OTP flow on frontend
    res.status(201).json({
      success: true,
      email: response.email,
      message: "Registration initiated. Please check your email for OTP."
    });
  } catch (err) {
    next(err);
  }
};

export const complete = async (req, res, next) => {
  try {
    const result = await completeRegistration(req.body);
    res.status(201).json({ success: true, ...result });
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
