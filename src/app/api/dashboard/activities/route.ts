import { NextResponse } from "next/server";
import pool from "@/lib/db";

async function ensureTables() {
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS offers (
      id SERIAL PRIMARY KEY,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      message TEXT,
      offer_item TEXT,
      offer_images TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id SERIAL PRIMARY KEY,
      event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, user_id)
    );
  `);
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS donations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      message TEXT,
      screenshot_url TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function getDefaultActivities() {
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();

  return [
    { id: "EVENT-1", name: "River Cleanup Drive", user: "Sagar Thapa", icon: "📅", status: "Registered", date: daysAgo(0), type: "event" },
    { id: "POST-5", name: "Used Books Exchange", user: "Priya Sharma", icon: "🔄", status: "Listed", date: daysAgo(0.5), type: "post" },
    { id: "OFFER-3", name: "Bicycle Repair Kit", user: "Rahul KC", icon: "💬", status: "Accepted", date: daysAgo(1), type: "offer" },
    { id: "POST-4", name: "Plastic Bottles Recycling", user: "Anita Gurung", icon: "♻", status: "Listed", date: daysAgo(1.5), type: "post" },
    { id: "EVENT-3", name: "Community Gardening", user: "Binod Rai", icon: "📅", status: "Registered", date: daysAgo(2), type: "event" },
    { id: "OFFER-1", name: "Old Furniture Donation", user: "Maya Tamang", icon: "🎁", status: "Pending", date: daysAgo(2.5), type: "offer" },
    { id: "POST-2", name: "Electronic Waste Collection", user: "Kiran Poudel", icon: "♻", status: "Listed", date: daysAgo(3), type: "post" },
    { id: "EVENT-2", name: "Tree Plantation Event", user: "Simran KC", icon: "📅", status: "Registered", date: daysAgo(4), type: "event" },
    { id: "DONATION-1", name: "Donated Rs 2500 to SewaGo", user: "Suman Shrestha", icon: "💰", status: "Donated", date: daysAgo(1.2), type: "donation" },
  ];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const showAll = searchParams.get("all") === "true";

  try {
    await ensureTables();

    const postsResult = await pool.query(
      `SELECT posts.id, posts.title, posts.type, posts.created_at,
              COALESCE(users.name, 'Anonymous') AS user_name
       FROM posts
       LEFT JOIN users ON posts.user_id = users.id
       ORDER BY posts.created_at DESC
       LIMIT ${showAll ? 20 : 5}`
    );

    const offersResult = await pool.query(
      `SELECT offers.id, offers.offer_item, offers.status, offers.created_at,
              COALESCE(users.name, 'Anonymous') AS user_name,
              posts.title AS post_title
       FROM offers
       LEFT JOIN users ON offers.user_id = users.id
       LEFT JOIN posts ON offers.post_id = posts.id
       ORDER BY offers.created_at DESC
       LIMIT ${showAll ? 20 : 5}`
    );

    const eventsResult = await pool.query(
      `SELECT event_registrations.id, event_registrations.created_at,
              events.title AS event_title,
              COALESCE(users.name, 'Anonymous') AS user_name
       FROM event_registrations
       LEFT JOIN events ON event_registrations.event_id = events.id
       LEFT JOIN users ON event_registrations.user_id = users.id
       ORDER BY event_registrations.created_at DESC
       LIMIT ${showAll ? 20 : 5}`
    );

    let donationsResult;
    try {
      donationsResult = await pool.query(
        `SELECT donations.id, donations.amount, donations.name AS donor_name, donations.created_at,
                COALESCE(users.name, donations.name) AS user_name
         FROM donations
         LEFT JOIN users ON donations.user_id = users.id
         WHERE donations.status = 'verified'
         ORDER BY donations.created_at DESC
         LIMIT ${showAll ? 20 : 5}`
      );
    } catch {
      donationsResult = { rows: [] };
    }

    const activities = [
      ...postsResult.rows.map((r: any) => ({
        id: `POST-${r.id}`,
        name: r.title,
        user: r.user_name,
        icon: r.type === "exchange" ? "🔄" : r.type === "donation" ? "🎁" : r.type === "request" ? "🙋" : "♻",
        status: "Listed",
        date: r.created_at,
        type: "post",
      })),
      ...offersResult.rows.map((r: any) => ({
        id: `OFFER-${r.id}`,
        name: r.offer_item || r.post_title || "Untitled",
        user: r.user_name,
        icon: "💬",
        status: r.status === "accepted" ? "Accepted" : r.status === "rejected" ? "Rejected" : "Pending",
        date: r.created_at,
        type: "offer",
      })),
      ...eventsResult.rows.map((r: any) => ({
        id: `EVENT-${r.id}`,
        name: r.event_title || "Untitled",
        user: r.user_name,
        icon: "📅",
        status: "Registered",
        date: r.created_at,
        type: "event",
      })),
      ...donationsResult.rows.map((r: any) => ({
        id: `DONATION-${r.id}`,
        name: `Donated Rs ${r.amount} to SewaGo`,
        user: r.user_name,
        icon: "💰",
        status: "Donated",
        date: r.created_at,
        type: "donation",
      })),
    ];

    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ activities: showAll ? activities : activities.slice(0, 8) });
  } catch (error) {
    console.error("Error fetching activities:", error);
    const defaultActivities = getDefaultActivities();
    return NextResponse.json({ activities: showAll ? defaultActivities : defaultActivities.slice(0, 8) });
  }
}
