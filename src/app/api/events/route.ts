import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

async function ensureEventsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      event_date DATE NOT NULL,
      event_time TIME,
      location VARCHAR(255),
      image_url TEXT,
      images TEXT[] DEFAULT '{}',
      contact_email VARCHAR(255),
      contact_phone VARCHAR(50),
      max_attendees INTEGER,
      registration_link TEXT,
      is_published BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const cols = [
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255)`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50)`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS max_attendees INTEGER`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_link TEXT`,
  ];
  for (const q of cols) {
    try { await pool.query(q); } catch {}
  }
}

export async function GET() {
  try {
    await ensureEventsTable();
    const result = await pool.query(
      `SELECT events.*, COALESCE(users.name, 'Anonymous') AS organizer_name
       FROM events
       LEFT JOIN users ON events.user_id = users.id
       WHERE events.is_published = TRUE
       ORDER BY events.event_date ASC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureEventsTable();

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

    const {
      title, description, category, event_date, event_time, location,
      image_url, images, contact_email, contact_phone, max_attendees, registration_link
    } = await req.json();

    if (!title || !description || !category || !event_date) {
      return NextResponse.json({ error: "Title, description, category, and date are required" }, { status: 400 });
    }

    const finalImages = images && images.length > 0 ? images : (image_url ? [image_url] : []);

    const result = await pool.query(
      `INSERT INTO events (user_id, title, description, category, event_date, event_time, location, image_url, images, contact_email, contact_phone, max_attendees, registration_link, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        userId, title, description, category, event_date, event_time || null,
        location || null, finalImages[0] || null, finalImages,
        contact_email || null, contact_phone || null, max_attendees || null, registration_link || null,
        isVerified
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
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
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const existing = await pool.query("SELECT user_id FROM events WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (String(existing.rows[0].user_id) !== userId) {
      return NextResponse.json({ error: "Not authorized to delete this event" }, { status: 403 });
    }

    await pool.query("DELETE FROM events WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
