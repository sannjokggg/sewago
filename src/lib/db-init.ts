import pool from "@/lib/db";

export async function initializeAuthTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      phone_number VARCHAR(20) UNIQUE,
      dob DATE,
      address TEXT,
      id_card_url TEXT,
      profile_photo TEXT,
      role VARCHAR(20) DEFAULT 'user',
      verification_status VARCHAR(20) DEFAULT 'pending',
      is_verified BOOLEAN DEFAULT FALSE,
      verified_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const addColumns = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) UNIQUE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS id_card_url TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP`,
  ];

  for (const sql of addColumns) {
    await pool.query(`DO $$ BEGIN ${sql}; EXCEPTION WHEN duplicate_column THEN null; END $$;`);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id SERIAL PRIMARY KEY,
      phone_number VARCHAR(20) NOT NULL,
      otp_code VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_otp_verifications (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp_code VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
