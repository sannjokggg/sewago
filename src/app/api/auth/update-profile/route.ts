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
    const contentType = req.headers.get("content-type") || "";
    let userId: string;
    let firstName: string;
    let lastName: string;
    let email: string | null = null;
    let dob: string | null = null;
    let address: string | null = null;
    let profilePhotoUrl: string | null = null;
    let idCardUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      userId = formData.get("userId") as string;
      firstName = formData.get("firstName") as string;
      lastName = formData.get("lastName") as string;
      email = formData.get("email") as string | null;
      dob = formData.get("dob") as string | null;
      address = formData.get("address") as string | null;

      const profilePhotoFile = formData.get("profilePhoto") as File | null;
      if (profilePhotoFile && profilePhotoFile.size > 0) {
        profilePhotoUrl = await saveFile(profilePhotoFile);
      }

      const idCardFile = formData.get("idCard") as File | null;
      if (idCardFile && idCardFile.size > 0) {
        idCardUrl = await saveFile(idCardFile);
      }
    } else {
      const body = await req.json();
      userId = body.userId;
      firstName = body.firstName || body.name?.split(" ")[0] || "";
      lastName = body.lastName || body.name?.split(" ").slice(1).join(" ") || "";
      email = body.email || null;
    }

    if (!userId || !firstName) {
      return NextResponse.json({ error: "User ID and name are required" }, { status: 400 });
    }

    const fullName = `${firstName} ${lastName}`.trim();
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

    values.push(userId);
    await pool.query(`UPDATE users SET ${sets.join(", ")} WHERE id = $${idx}`, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
