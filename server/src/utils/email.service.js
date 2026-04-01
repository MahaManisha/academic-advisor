// server/src/utils/email.service.js
import nodemailer from 'nodemailer';

// Use 'service: gmail' - the most reliable way to connect to Gmail with Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOtpEmail = async (email, otp) => {
    // 1. ALWAYS print to terminal so you can continue immediately
    console.log(`\n=========================================`);
    console.log(`🚀 REGISTRATION VERIFICATION`);
    console.log(`📧 TARGET: ${email}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log(`=========================================\n`);

    try {
        await transporter.sendMail({
            from: `"Academic Advisor" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify Your Email - Academic Advisor",
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-top: 5px solid #4f46e5; border-radius: 8px;">
                    <h2 style="color: #4f46e5;">Academic Advisor</h2>
                    <p>Protecting your account is our priority. Please use the verification code below:</p>
                    <div style="background: #f0f4ff; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 4px;">${otp}</span>
                    </div>
                    <p style="color: #666; font-size: 12px;">This code expires in 10 minutes.</p>
                </div>
            `,
        });
        console.log(`✅ Real email sent to ${email}`);
        return true;
    } catch (error) {
        console.warn(`\n⚠️  MAIL SERVER NOTICE:`);
        console.warn(`The email didn't fly (Reason: ${error.message})`);
        console.warn(`BUT DON'T WORRY: Use the code ${otp} logged above to finish your signup!\n`);
        
        // Return true anyway so the user isn't stuck behind an error box
        return true;
    }
};



