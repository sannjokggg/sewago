import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [usersRes, pendingRes, postsRes, donationsRes] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM users"),
      pool.query("SELECT COUNT(*)::int AS count FROM users WHERE verification_status = 'pending'"),
      pool.query("SELECT COUNT(*)::int AS count FROM posts"),
      pool.query("SELECT COUNT(*)::int AS count FROM donations"),
    ]);

    return NextResponse.json({
      totalUsers: usersRes.rows[0].count,
      pendingVerifications: pendingRes.rows[0].count,
      totalPosts: postsRes.rows[0].count,
      totalDonations: donationsRes.rows[0].count,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
