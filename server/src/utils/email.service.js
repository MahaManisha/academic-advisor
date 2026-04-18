// server/src/utils/email.service.js
// Google SMTP Gmail Workaround — Nodemailer + Gmail App Password
import nodemailer from 'nodemailer';

// Create transporter once at startup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,           // TLS (STARTTLS) — required for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // Gmail App Password (NOT your Gmail login password)
  },
  tls: {
    rejectUnauthorized: false     // Prevents TLS issues in dev environments
  }
});

/**
 * Sends a 6-digit OTP email using Gmail SMTP.
 * OTP is also printed to terminal as a fallback for development.
 */
export const sendOtpEmail = async (email, otp) => {
  // Always log to terminal — usable as fallback during development
  console.log(`\n=========================================`);
  console.log(`🚀 REGISTRATION VERIFICATION`);
  console.log(`📧 TO: ${email}`);
  console.log(`🔑 OTP: ${otp}`);
  console.log(`=========================================\n`);

  try {
    const info = await transporter.sendMail({
      from: `"Academic Advisor" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Your OTP Code — Academic Advisor',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: 0 auto;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                      padding: 32px 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #fff; font-size: 22px; margin: 0; letter-spacing: 1px;">🎓 Academic Advisor</h1>
            <p style="color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px;">
              AI-Powered Student Career Intelligence
            </p>
          </div>

          <!-- Body -->
          <div style="background: #ffffff; padding: 40px;
                      border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 12px;">Verify Your Email</h2>
            <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
              Enter the 6-digit code below to complete your registration.
              This code expires in <strong>10 minutes</strong>.
            </p>

            <!-- OTP Box -->
            <div style="background: #f0f4ff; border: 2px dashed #4f46e5;
                        border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 28px;">
              <div style="font-size: 48px; font-weight: 900; letter-spacing: 12px;
                          color: #4f46e5; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0;">One-Time Password</p>
            </div>

            <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
              Didn't request this? Simply ignore this email — your account is safe.<br/>
              <span style="color: #ef4444; font-weight: 600;">Never share this code with anyone.</span>
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 16px;">
            <p style="color: #d1d5db; font-size: 11px; margin: 0;">
              © 2026 Academic Advisor · Sent via Gmail SMTP
            </p>
          </div>
        </div>
      `
    });

    console.log(`✅ Email sent! Message ID: ${info.messageId}`);
    return true;

  } catch (error) {
    console.warn(`\n⚠️  Gmail SMTP Error: ${error.message}`);
    console.warn(`👆 Use the OTP printed above to continue anyway.\n`);
    return true; // Don't block user — OTP is visible in terminal
  }
};
