import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { ensureNotificationsTable, createNotification } from "@/lib/notifications";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as { role?: string }).role !== "admin") {
    return { error: "Forbidden", status: 403 };
  }
  return { userId: (session.user as { id: string }).id };
}

export async function GET() {
  try {
    const admin = await checkAdmin();
    if ("error" in admin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const result = await pool.query(
      `SELECT id, name, first_name, last_name, email, phone_number, dob, address, id_card_url, profile_photo, verification_status, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await checkAdmin();
    if ("error" in admin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const { userId, action, reason } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "userId and action required" }, { status: 400 });
    }

    if (action === "verify") {
      await pool.query(
        `UPDATE users SET verification_status = 'verified', is_verified = TRUE, verified_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [userId]
      );
      // Auto-publish all pending content from this user
      await pool.query(`UPDATE posts SET is_published = TRUE WHERE user_id = $1 AND is_published = FALSE`, [userId]);
      await pool.query(`UPDATE offers SET is_published = TRUE WHERE user_id = $1 AND is_published = FALSE`, [userId]);
      await pool.query(`UPDATE events SET is_published = TRUE WHERE user_id = $1 AND is_published = FALSE`, [userId]);

      await ensureNotificationsTable();
      await createNotification(
        userId,
        "account_verified",
        "Your account has been verified! Your posts, offers, and events are now published.",
        userId,
        "/dashboard"
      );
      return NextResponse.json({ success: true, status: "verified" });
    }

    if (action === "reject") {
      await pool.query(
        `UPDATE users SET verification_status = 'rejected', is_verified = FALSE WHERE id = $1`,
        [userId]
      );
      await ensureNotificationsTable();
      await createNotification(
        userId,
        "account_rejected",
        `Your account verification was rejected.${reason ? " Reason: " + reason : ""}`,
        userId,
        "/dashboard"
      );
      return NextResponse.json({ success: true, status: "rejected" });
    }

    return NextResponse.json({ error: "Invalid action. Use 'verify' or 'reject'." }, { status: 400 });
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json({ error: "Failed to verify user" }, { status: 500 });
  }
}
