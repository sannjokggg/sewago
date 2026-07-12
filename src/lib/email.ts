import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ionos.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmailOtp(to: string, otp: string): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[MOCK EMAIL] OTP for ${to}: ${otp}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"SewaGo" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your SewaGo Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: #1a2e1a; border-radius: 50%; width: 48px; height: 48px; line-height: 48px;">
              <span style="color: white; font-size: 20px; font-weight: bold;">S</span>
            </div>
          </div>
          <h2 style="text-align: center; color: #1a2e1a; margin-bottom: 8px;">Verify Your Email</h2>
          <p style="text-align: center; color: #666; font-size: 14px; margin-bottom: 32px;">
            Use the code below to verify your email address on SewaGo.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a2e1a; background: #f5f5f5; padding: 16px 32px; border-radius: 12px;">
              ${otp}
            </span>
          </div>
          <p style="text-align: center; color: #999; font-size: 12px;">
            This code expires in 5 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    console.log(`[MOCK EMAIL] OTP for ${to}: ${otp}`);
    return true;
  }
}
