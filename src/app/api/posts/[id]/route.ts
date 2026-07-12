import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const postResult = await pool.query(
      `SELECT posts.*, users.name AS user_name, users.email AS user_email
       FROM posts
       LEFT JOIN users ON posts.user_id = users.id
       WHERE posts.id = $1`,
      [id]
    );

    if (postResult.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = postResult.rows[0];
    if (post.images) {
      try { post.images = JSON.parse(post.images); } catch { post.images = post.image_url ? [post.image_url] : []; }
    } else {
      post.images = post.image_url ? [post.image_url] : [];
    }

    const reviewsResult = await pool.query(
      `SELECT reviews.*, users.name AS user_name
       FROM reviews
       LEFT JOIN users ON reviews.user_id = users.id
       WHERE reviews.post_id = $1
       ORDER BY reviews.created_at DESC`,
      [id]
    );

    const commentsResult = await pool.query(
      `SELECT comments.*, users.name AS user_name
       FROM comments
       LEFT JOIN users ON comments.user_id = users.id
       WHERE comments.post_id = $1
       ORDER BY comments.created_at DESC`,
      [id]
    );

    return NextResponse.json({
      ...post,
      reviews: reviewsResult.rows,
      comments: commentsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;
    const { id } = await params;

    const existing = await pool.query("SELECT user_id FROM posts WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (String(existing.rows[0].user_id) !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { title, description, type, price, category, images, is_available } = await req.json();
    const imagesJson = images && images.length > 0 ? JSON.stringify(images) : null;
    const fallbackImage = images && images.length > 0 ? images[0] : null;

    const result = await pool.query(
      `UPDATE posts SET title = $1, description = $2, type = $3, price = $4, category = $5, image_url = $6, images = $7, is_available = $8
       WHERE id = $9 RETURNING *`,
      [title, description, type, price || null, category || null, fallbackImage, imagesJson, is_available !== undefined ? is_available : true, id]
    );

    const row = result.rows[0];
    if (row.images) {
      try { row.images = JSON.parse(row.images); } catch { row.images = row.image_url ? [row.image_url] : []; }
    } else {
      row.images = row.image_url ? [row.image_url] : [];
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
