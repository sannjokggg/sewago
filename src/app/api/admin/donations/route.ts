import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { ensureNotificationsTable, createNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await pool.query(
      `SELECT * FROM donations ORDER BY created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    await pool.query(
      `UPDATE donations SET status = $1 WHERE id = $2`,
      [status, id]
    );

    const donationResult = await pool.query(
      `SELECT user_id, name, email, amount FROM donations WHERE id = $1`,
      [id]
    );

    if (donationResult.rows.length > 0) {
      await ensureNotificationsTable();
      const donation = donationResult.rows[0];
      const donorName = donation.name;
      const donationAmount = donation.amount;

      // Notify the donor
      if (donation.user_id) {
        await createNotification(
          donation.user_id,
          "donation_verified",
          `Your donation of Rs ${donationAmount} has been ${status === "verified" ? "verified" : "rejected"}. Thank you for your generosity!`,
          Number(id),
          "/dashboard"
        );
      }

      // Notify ALL other users about verified donation
      if (status === "verified") {
        const allUsers = await pool.query(
          `SELECT id FROM users WHERE id != $1`,
          [donation.user_id || 0]
        );
        for (const user of allUsers.rows) {
          await createNotification(
            user.id,
            "donation_verified",
            `${donorName} has donated Rs ${donationAmount} to SewaGo. Their generosity helps our community!`,
            Number(id),
            "/dashboard"
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating donation:", error);
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 });
  }
}
