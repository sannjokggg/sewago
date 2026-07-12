import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

async function ensureSettingsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversation_settings (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      muted BOOLEAN DEFAULT FALSE,
      blocked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(conversation_id, user_id)
    );
  `);
}

export async function GET(req: Request) {
  try {
    await ensureSettingsTable();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId required" }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT muted, blocked FROM conversation_settings WHERE conversation_id = $1 AND user_id = $2`,
      [conversationId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ muted: false, blocked: false });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching conversation settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await ensureSettingsTable();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;
    const { conversationId, action } = await req.json();

    if (!conversationId || !action) {
      return NextResponse.json({ error: "conversationId and action required" }, { status: 400 });
    }

    if (action === "mute") {
      const existing = await pool.query(
        `SELECT muted FROM conversation_settings WHERE conversation_id = $1 AND user_id = $2`,
        [conversationId, userId]
      );
      const currentMuted = existing.rows[0]?.muted || false;
      await pool.query(
        `INSERT INTO conversation_settings (conversation_id, user_id, muted)
         VALUES ($1, $2, $3)
         ON CONFLICT (conversation_id, user_id) DO UPDATE SET muted = $3`,
        [conversationId, userId, !currentMuted]
      );
      return NextResponse.json({ muted: !currentMuted });
    }

    if (action === "block") {
      const existing = await pool.query(
        `SELECT blocked FROM conversation_settings WHERE conversation_id = $1 AND user_id = $2`,
        [conversationId, userId]
      );
      const currentBlocked = existing.rows[0]?.blocked || false;
      await pool.query(
        `INSERT INTO conversation_settings (conversation_id, user_id, blocked)
         VALUES ($1, $2, $3)
         ON CONFLICT (conversation_id, user_id) DO UPDATE SET blocked = $3`,
        [conversationId, userId, !currentBlocked]
      );
      return NextResponse.json({ blocked: !currentBlocked });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating conversation settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;
    const { conversationId } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId required" }, { status: 400 });
    }

    const convCheck = await pool.query(
      `SELECT id FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [conversationId, userId]
    );

    if (convCheck.rows.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    await pool.query(`DELETE FROM messages WHERE conversation_id = $1`, [conversationId]);
    await pool.query(`DELETE FROM conversation_settings WHERE conversation_id = $1`, [conversationId]);
    await pool.query(`DELETE FROM conversations WHERE id = $1`, [conversationId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
