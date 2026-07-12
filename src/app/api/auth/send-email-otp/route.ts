import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { generateOtp, getOtpExpiry } from "@/lib/sms";
import { sendEmailOtp } from "@/lib/email";
import { initializeAuthTables } from "@/lib/db-init";

const MAX_REQUESTS = 3;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    await initializeAuthTables();

    // Ensure email_otp_verifications table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_otp_verifications (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Rate limit: max 3 OTPs per 10 minutes
    const recentOtps = await pool.query(
      `SELECT id FROM email_otp_verifications
       WHERE email = $1 AND created_at > NOW() - INTERVAL '10 minutes'`,
      [email]
    );

    if (recentOtps.rows.length >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: "Too many requests. Please wait 10 minutes." },
        { status: 429 }
      );
    }

    // Invalidate previous unverified OTPs for this email
    await pool.query(
      `UPDATE email_otp_verifications SET verified = TRUE
       WHERE email = $1 AND verified = FALSE`,
      [email]
    );

    const otp = generateOtp();
    const expiresAt = getOtpExpiry();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await pool.query(
      `INSERT INTO email_otp_verifications (email, otp_code, expires_at)
       VALUES ($1, $2, $3)`,
      [email, hashedOtp, expiresAt]
    );

    const sent = await sendEmailOtp(email, otp);

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Send email OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
