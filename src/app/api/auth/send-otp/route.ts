import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { generateOtp, getOtpExpiry, sendSmsOtp } from "@/lib/sms";
import { initializeAuthTables } from "@/lib/db-init";

const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const MAX_REQUESTS = 3;

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const cleaned = phoneNumber.replace(/\s/g, "");
    if (!/^\+?[1-9]\d{6,14}$/.test(cleaned)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    await initializeAuthTables();

    const recentOtps = await pool.query(
      `SELECT id FROM otp_verifications
       WHERE phone_number = $1 AND created_at > NOW() - INTERVAL '10 minutes'`,
      [cleaned]
    );

    if (recentOtps.rows.length >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: "Too many requests. Please wait 10 minutes." },
        { status: 429 }
      );
    }

    await pool.query(
      `UPDATE otp_verifications SET verified = TRUE
       WHERE phone_number = $1 AND verified = FALSE`,
      [cleaned]
    );

    const otp = generateOtp();
    const expiresAt = getOtpExpiry();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await pool.query(
      `INSERT INTO otp_verifications (phone_number, otp_code, expires_at)
       VALUES ($1, $2, $3)`,
      [cleaned, hashedOtp, expiresAt]
    );

    const sent = await sendSmsOtp(cleaned, otp);

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
