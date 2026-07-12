import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { initializeAuthTables } from "@/lib/db-init";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        await initializeAuthTables();

        if (credentials?.phone && credentials?.otp) {
          const cleaned = credentials.phone.replace(/\s/g, "");

          const otpResult = await pool.query(
            `SELECT * FROM otp_verifications
             WHERE phone_number = $1 AND verified = FALSE
             ORDER BY created_at DESC LIMIT 1`,
            [cleaned]
          );

          if (otpResult.rows.length === 0) {
            throw new Error("No OTP found. Please request a new code.");
          }

          const otpRecord = otpResult.rows[0];

          if (new Date(otpRecord.expires_at) < new Date()) {
            throw new Error("OTP has expired. Please request a new code.");
          }

          const isValid = await bcrypt.compare(credentials.otp, otpRecord.otp_code);

          if (!isValid) {
            throw new Error("Invalid OTP code");
          }

          await pool.query(
            `UPDATE otp_verifications SET verified = TRUE WHERE id = $1`,
            [otpRecord.id]
          );

          let userResult = await pool.query(
            "SELECT id, name, email, role, verification_status, is_verified FROM users WHERE phone_number = $1",
            [cleaned]
          );

          if (userResult.rows.length === 0) {
            userResult = await pool.query(
              `INSERT INTO users (name, phone_number, verification_status, is_verified) VALUES ($1, $2, 'pending', FALSE)
               RETURNING id, name, email, role, verification_status, is_verified`,
              ["User", cleaned]
            );
          }

          const user = userResult.rows[0];

          return {
            id: user.id.toString(),
            email: user.email || `${cleaned}@phone.local`,
            name: user.name,
            role: user.role || "user",
            verificationStatus: user.verification_status || "pending",
            isVerified: user.is_verified || false,
          };
        }

        if (credentials?.phone && !credentials?.otp) {
          const cleaned = credentials.phone.replace(/\s/g, "");
          const userResult = await pool.query(
            "SELECT id, name, email, role, verification_status, is_verified FROM users WHERE phone_number = $1",
            [cleaned]
          );

          if (userResult.rows.length === 0) {
            throw new Error("No account found. Please register first.");
          }

          const user = userResult.rows[0];

          return {
            id: user.id.toString(),
            email: user.email || `${cleaned}@phone.local`,
            name: user.name,
            role: user.role || "user",
            verificationStatus: user.verification_status || "pending",
            isVerified: user.is_verified || false,
          };
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const result = await pool.query(
          "SELECT id, name, email, password, role, verification_status, is_verified FROM users WHERE email = $1",
          [credentials.email]
        );

        const user = result.rows[0];

        if (!user) {
          throw new Error("No account found with this email");
        }

        if (!user.password) {
          throw new Error("This account uses phone login. Please use phone number to sign in.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || "user",
          verificationStatus: user.verification_status || "pending",
          isVerified: user.is_verified || false,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      const isAdminEmail = user.email && user.email === process.env.ADMIN_EMAIL;

      if (account?.provider === "google") {
        await initializeAuthTables();
        const email = user.email;
        if (email) {
          const existing = await pool.query(
            "SELECT id, role, verification_status, is_verified FROM users WHERE email = $1",
            [email]
          );
          if (existing.rows.length === 0) {
            const status = isAdminEmail ? "verified" : "pending";
            const verified = isAdminEmail;
            const role = isAdminEmail ? "admin" : "user";
            const result = await pool.query(
              `INSERT INTO users (name, email, verification_status, is_verified, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, role, verification_status, is_verified`,
              [user.name || "User", email, status, verified, role]
            );
            user.id = result.rows[0].id.toString();
            (user as { role?: string }).role = result.rows[0].role;
            (user as { verificationStatus?: string }).verificationStatus = result.rows[0].verification_status;
            (user as { isVerified?: boolean }).isVerified = result.rows[0].is_verified;
          } else {
            user.id = existing.rows[0].id.toString();
            (user as { role?: string }).role = existing.rows[0].role || "user";
            (user as { verificationStatus?: string }).verificationStatus = existing.rows[0].verification_status || "pending";
            (user as { isVerified?: boolean }).isVerified = existing.rows[0].is_verified || false;
          }

          // Auto-promote admin email
          if (isAdminEmail) {
            await pool.query(
              `UPDATE users SET role = 'admin', is_verified = TRUE, verification_status = 'verified' WHERE email = $1`,
              [email]
            );
            (user as { role?: string }).role = "admin";
            (user as { verificationStatus?: string }).verificationStatus = "verified";
            (user as { isVerified?: boolean }).isVerified = true;
          }
        }
      }

      // Auto-promote admin email for credentials login
      if (isAdminEmail && user.id) {
        await initializeAuthTables();
        await pool.query(
          `UPDATE users SET role = 'admin', is_verified = TRUE, verification_status = 'verified' WHERE id = $1`,
          [user.id]
        );
        (user as { role?: string }).role = "admin";
        (user as { verificationStatus?: string }).verificationStatus = "verified";
        (user as { isVerified?: boolean }).isVerified = true;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "user";
        token.verificationStatus = (user as { verificationStatus?: string }).verificationStatus || "pending";
        token.isVerified = (user as { isVerified?: boolean }).isVerified || false;
      }
      // Force admin for ADMIN_EMAIL on every token refresh
      if (token.email && token.email === process.env.ADMIN_EMAIL) {
        if (token.role !== "admin") {
          token.role = "admin";
          token.verificationStatus = "verified";
          token.isVerified = true;
          // Sync to DB
          try {
            await pool.query(
              `UPDATE users SET role = 'admin', is_verified = TRUE, verification_status = 'verified' WHERE email = $1`,
              [token.email]
            );
          } catch {}
        }
      }
      // Refresh role/status from DB on each token use for real-time updates
      if (token.id) {
        try {
          const result = await pool.query(
            "SELECT role, verification_status, is_verified, first_name FROM users WHERE id = $1",
            [token.id]
          );
          if (result.rows.length > 0) {
            // Don't override admin if DB says user (admin email always wins)
            const dbRole = result.rows[0].role || "user";
            if (token.role === "admin" || dbRole === "admin") {
              token.role = "admin";
            } else {
              token.role = dbRole;
            }
            token.verificationStatus = result.rows[0].verification_status || "pending";
            token.isVerified = result.rows[0].is_verified || false;
            token.needsProfileCompletion = !result.rows[0].first_name;
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role?: string }).role = (token.role as string) || "user";
        (session.user as { verificationStatus?: string }).verificationStatus = (token.verificationStatus as string) || "pending";
        (session.user as { isVerified?: boolean }).isVerified = (token.isVerified as boolean) || false;
        (session.user as { needsProfileCompletion?: boolean }).needsProfileCompletion = (token.needsProfileCompletion as boolean) || false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
