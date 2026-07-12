import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

async function ensurePostsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      price VARCHAR(50),
      category VARCHAR(100),
      image_url TEXT,
      images TEXT,
      is_published BOOLEAN DEFAULT TRUE,
      is_available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  try {
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS images TEXT`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE`);
  } catch {}
}

export async function GET() {
  try {
    await ensurePostsTable();
    const result = await pool.query(
      `SELECT posts.*, COALESCE(users.name, 'Anonymous') AS user_name
       FROM posts
       LEFT JOIN users ON posts.user_id = users.id
       WHERE posts.is_published = TRUE
       ORDER BY posts.created_at DESC`
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
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensurePostsTable();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const userCheck = await pool.query(
      "SELECT is_verified FROM users WHERE id = $1",
      [userId]
    );
    const isVerified = userCheck.rows.length > 0 && userCheck.rows[0].is_verified;

    const { title, description, type, price, category, image_url, images } = await req.json();

    if (!title || !description || !type) {
      return NextResponse.json({ error: "Title, description, and type are required" }, { status: 400 });
    }

    const imagesArray = images || (image_url ? [image_url] : []);
    const imagesJson = imagesArray.length > 0 ? JSON.stringify(imagesArray) : null;
    const fallbackImage = imagesArray.length > 0 ? imagesArray[0] : null;

    const result = await pool.query(
      `INSERT INTO posts (user_id, title, description, type, price, category, image_url, images, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, title, description, type, price || null, category || null, fallbackImage, imagesJson, isVerified]
    );

    const row = result.rows[0];
    row.images = imagesArray;
    row.is_published = isVerified;

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 });
    }

    const existing = await pool.query("SELECT user_id FROM posts WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (String(existing.rows[0].user_id) !== userId) {
      return NextResponse.json({ error: "Not authorized to delete this post" }, { status: 403 });
    }

    await pool.query("DELETE FROM posts WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
