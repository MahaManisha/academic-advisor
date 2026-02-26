import nodemailer from 'nodemailer';
// dotenv is loaded in server.js entry point

// Create transporter
// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Debug Log (Safe)





// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error("❌ Mail Server Error:", error);
    } else {

    }
});

export const sendOtpEmail = async (email, otp) => {


    try {
        const info = await transporter.sendMail({
            from: `"Academic Advisor" <${process.env.EMAIL_USER}>`,
            to: email, // list of receivers
            subject: "Verify Your Email - Academic Advisor", // Subject line
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #4f46e5; text-align: center;">Academic Advisor</h2>
                        <p style="font-size: 16px; color: #333;">Hello,</p>
                        <p style="font-size: 16px; color: #333;">Your verification code is:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; background-color: #eef2ff; padding: 10px 20px; border-radius: 5px;">${otp}</span>
                        </div>
                        <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
                        <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
                    </div>
                </div>
            `, // html body
        });


        return true;
    } catch (error) {
        console.error("❌ Failed to send OTP email:", error);
        throw new Error("Email delivery failed. Please check your email address or try again later.");
    }
};
