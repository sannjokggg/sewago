import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { initializeAuthTables } from "@/lib/db-init";
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

interface RegisterFields {
  firstName: string;
  lastName: string;
  email: string | null;
  password: string | null;
  phoneNumber: string | null;
  dob: string | null;
  address: string | null;
  idCardUrl: string | null;
  profilePhotoUrl: string | null;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let fields: RegisterFields;
    let idCardFile: File | null = null;
    let profilePhotoFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const firstName = formData.get("firstName") as string | null;
      const lastName = formData.get("lastName") as string | null;
      fields = {
        firstName: firstName || "",
        lastName: lastName || "",
        email: formData.get("email") as string | null,
        password: formData.get("password") as string | null,
        phoneNumber: formData.get("phoneNumber") as string | null,
        dob: formData.get("dob") as string | null,
        address: formData.get("address") as string | null,
        idCardUrl: null,
        profilePhotoUrl: null,
      };
      idCardFile = formData.get("idCard") as File | null;
      profilePhotoFile = formData.get("profilePhoto") as File | null;
    } else {
      const body = await req.json();
      fields = {
        firstName: body.firstName || "",
        lastName: body.lastName || "",
        email: body.email || null,
        password: body.password || null,
        phoneNumber: body.phoneNumber || null,
        dob: null,
        address: null,
        idCardUrl: null,
        profilePhotoUrl: null,
      };
    }

    if (!fields.firstName || !fields.lastName) {
      return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
    }

    if (!fields.email && !fields.phoneNumber) {
      return NextResponse.json(
        { error: "Either email or phone number is required" },
        { status: 400 }
      );
    }

    if (fields.email && !fields.password) {
      return NextResponse.json(
        { error: "Password is required when registering with email" },
        { status: 400 }
      );
    }

    if (idCardFile && idCardFile.size > 0) {
      fields.idCardUrl = await saveFile(idCardFile);
    }

    if (profilePhotoFile && profilePhotoFile.size > 0) {
      fields.profilePhotoUrl = await saveFile(profilePhotoFile);
    }

    await initializeAuthTables();

    if (fields.email) {
      const existingEmail = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [fields.email]
      );
      if (existingEmail.rows.length > 0) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
    }

    if (fields.phoneNumber) {
      const cleaned = fields.phoneNumber.replace(/\s/g, "");
      const existingPhone = await pool.query(
        "SELECT id FROM users WHERE phone_number = $1",
        [cleaned]
      );
      if (existingPhone.rows.length > 0) {
        return NextResponse.json({ error: "Phone number already exists" }, { status: 400 });
      }
    }

    const hashedPassword = fields.password ? await bcrypt.hash(fields.password, 12) : null;
    const cleanedPhone = fields.phoneNumber ? fields.phoneNumber.replace(/\s/g, "") : null;
    const fullName = `${fields.firstName} ${fields.lastName}`;

    const result = await pool.query(
      `INSERT INTO users (name, first_name, last_name, email, password, phone_number, dob, address, id_card_url, profile_photo, verification_status, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', FALSE)
       RETURNING id, name, first_name, last_name, email, phone_number, dob, address, id_card_url, profile_photo, verification_status`,
      [fullName, fields.firstName, fields.lastName, fields.email || null, hashedPassword, cleanedPhone, fields.dob || null, fields.address || null, fields.idCardUrl, fields.profilePhotoUrl]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
