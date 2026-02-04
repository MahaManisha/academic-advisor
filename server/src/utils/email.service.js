// server/src/utils/email.service.js

/**
 * MOCK Email Sender
 * Since we cannot introduce new libraries (nodemailer), we simulate sending
 * by logging to the console.
 */
export const sendOtpEmail = async (email, otp) => {
    console.log("==================================================");
    console.log(`🔐 [MOCK EMAIL] Sending OTP to: ${email}`);
    console.log(`🔑 OTP CODE: ${otp}`);
    console.log("==================================================");

    // In a real production app with nodemailer:
    // await transporter.sendMail({ to: email, subject: 'Your OTP', text: otp });

    return true;
};
