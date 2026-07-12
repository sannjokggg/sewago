import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { createNotification } from "@/lib/notifications";

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user1_id, user2_id)
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL DEFAULT '',
      image_url TEXT,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;`);
}

export async function GET() {
  try {
    await ensureTables();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    const result = await pool.query(
      `SELECT c.id, u.id AS other_id, u.name AS other_name, u.email AS other_email,
              m.text AS last_message, m.created_at AS last_time,
              (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND read = FALSE) AS unread
       FROM conversations c
       JOIN users u ON u.id = CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END
       LEFT JOIN LATERAL (
         SELECT text, created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
       ) m ON TRUE
       WHERE c.user1_id = $1 OR c.user2_id = $1
       ORDER BY m.created_at DESC NULLS LAST`,
      [userId]
    );

    const conversations = result.rows.map((row: { id: number; other_id: number; other_name: string; other_email: string; last_message: string | null; last_time: string | null; unread: string | number }) => ({
      id: row.id,
      otherId: row.other_id,
      name: row.other_name,
      email: row.other_email,
      lastMessage: row.last_message || "No messages yet",
      lastTime: row.last_time ? timeAgo(row.last_time) : "",
      unread: Number(row.unread),
    }));

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTables();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { conversationId, text, receiverId, imageUrl } = await req.json();

    if (!text && !imageUrl) {
      return NextResponse.json({ error: "Message text or image required" }, { status: 400 });
    }

    let convId = conversationId;

    if (!convId && receiverId) {
      const existing = await pool.query(
        `SELECT id FROM conversations
         WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
        [userId, receiverId]
      );
      if (existing.rows.length > 0) {
        convId = existing.rows[0].id;
      } else {
        const newConv = await pool.query(
          `INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING id`,
          [userId, receiverId]
        );
        convId = newConv.rows[0].id;
      }
    }

    if (!convId) {
      return NextResponse.json({ error: "Conversation ID or receiver ID required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, text, image_url) VALUES ($1, $2, $3, $4) RETURNING *`,
      [convId, userId, text || "", imageUrl || null]
    );

    // Determine receiver and create notification
    const senderId = Number(userId);
    const convResult = await pool.query(
      `SELECT user1_id, user2_id FROM conversations WHERE id = $1`,
      [convId]
    );
    if (convResult.rows.length > 0) {
      const { user1_id, user2_id } = convResult.rows[0];
      const receiverId = Number(user1_id) === senderId ? Number(user2_id) : Number(user1_id);
      const senderName = (session.user as { name?: string }).name || "Someone";
      const preview = (text || "").slice(0, 50) || "[Image]";
      createNotification(
        receiverId,
        "new_message",
        `${senderName} sent you a message: ${preview}`,
        result.rows[0].id,
        `/dashboard/messages`
      );
    }

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
