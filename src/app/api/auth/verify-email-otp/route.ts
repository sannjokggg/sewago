import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const otpResult = await pool.query(
      `SELECT * FROM email_otp_verifications
       WHERE email = $1 AND verified = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (otpResult.rows.length === 0) {
      return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 400 });
    }

    const otpRecord = otpResult.rows[0];

    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp_code);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // Mark OTP as verified
    await pool.query(
      `UPDATE email_otp_verifications SET verified = TRUE WHERE id = $1`,
      [otpRecord.id]
    );

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
