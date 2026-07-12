import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const result = await pool.query(
      `SELECT posts.*, COALESCE(users.name, 'Anonymous') AS user_name
       FROM posts
       LEFT JOIN users ON posts.user_id = users.id
       WHERE posts.user_id = $1
       ORDER BY posts.created_at DESC`,
      [userId]
    );

    const rows = result.rows.map((row) => {
      if (row.images) {
        try { row.images = JSON.parse(row.images); } catch { row.images = row.image_url ? [row.image_url] : []; }
      } else {
        row.images = row.image_url ? [row.image_url] : [];
      }
      return row;
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json({ error: "Failed to fetch user posts" }, { status: 500 });
  }
}
