import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function saveFile(file: File): Promise<string | null> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `sewago-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const phoneNumber = formData.get("phoneNumber") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string | null;
    const dob = formData.get("dob") as string | null;
    const address = formData.get("address") as string | null;

    if (!phoneNumber || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Phone number, first name, and last name are required" },
        { status: 400 }
      );
    }

    const cleaned = phoneNumber.replace(/\s/g, "");
    const fullName = `${firstName} ${lastName}`;

    const existing = await pool.query(
      "SELECT id FROM users WHERE phone_number = $1",
      [cleaned]
    );

    let profilePhotoUrl: string | null = null;
    let idCardUrl: string | null = null;

    const profilePhotoFile = formData.get("profilePhoto") as File | null;
    if (profilePhotoFile && profilePhotoFile.size > 0) {
      profilePhotoUrl = await saveFile(profilePhotoFile);
    }

    const idCardFile = formData.get("idCard") as File | null;
    if (idCardFile && idCardFile.size > 0) {
      idCardUrl = await saveFile(idCardFile);
    }

    if (existing.rows.length > 0) {
      const sets: string[] = ["name = $1", "first_name = $2", "last_name = $3"];
      const values: unknown[] = [fullName, firstName, lastName];
      let idx = 4;

      if (email) {
        sets.push(`email = $${idx}`);
        values.push(email);
        idx++;
      }
      if (dob) {
        sets.push(`dob = $${idx}`);
        values.push(dob);
        idx++;
      }
      if (address) {
        sets.push(`address = $${idx}`);
        values.push(address);
        idx++;
      }
      if (profilePhotoUrl) {
        sets.push(`profile_photo = $${idx}`);
        values.push(profilePhotoUrl);
        idx++;
      }
      if (idCardUrl) {
        sets.push(`id_card_url = $${idx}`);
        values.push(idCardUrl);
        idx++;
      }

      values.push(existing.rows[0].id);
      await pool.query(
        `UPDATE users SET ${sets.join(", ")} WHERE id = $${idx}`,
        values
      );

      return NextResponse.json({ success: true, userId: existing.rows[0].id });
    } else {
      const result = await pool.query(
        `INSERT INTO users (name, first_name, last_name, email, phone_number, dob, address, profile_photo, id_card_url, verification_status, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', FALSE)
         RETURNING id`,
        [
          fullName,
          firstName,
          lastName,
          email || null,
          cleaned,
          dob || null,
          address || null,
          profilePhotoUrl,
          idCardUrl,
        ]
      );

      return NextResponse.json({
        success: true,
        userId: result.rows[0].id,
      });
    }
  } catch (error) {
    console.error("Register phone error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
