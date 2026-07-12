"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OtpInput from "@/components/OtpInput";

type Tab = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!otpExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(otpExpiresAt).getTime() - Date.now()) / 1000)
      );
      setCountdown(remaining);
      if (remaining <= 0) {
        setOtpSent(false);
        setOtpExpiresAt(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);
    const fullPhone = `+977${phoneNumber}`;

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: fullPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setOtpExpiresAt(data.expiresAt);
      setLoading(false);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fullPhone = `+977${phoneNumber}`;

    const result = await signIn("credentials", {
      phone: fullPhone,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleResendOtp = () => {
    setOtp("");
    setOtpSent(false);
    setOtpExpiresAt(null);
    handleSendOtp();
  };

  return (
    <div className="w-full max-w-5xl rounded-[28px] bg-surface p-6 shadow-2xl">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-brand-dark">Welcome Back</h1>
          <p className="mt-1 text-xs text-text-secondary">Sign in to your SewaGo account</p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-border-default bg-surface px-4 py-2.5 text-xs font-semibold text-text-primary disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-default"></div>
          </div>
          <span className="relative bg-surface px-4 text-xs text-text-muted">or</span>
        </div>

        <div className="mb-4 flex rounded-full bg-surface-alt p-0.5 border border-border-default">
          <button
            type="button"
            onClick={() => { setTab("email"); setError(""); setOtp(""); setOtpSent(false); }}
            className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all ${
              tab === "email"
                ? "bg-accent text-brand-dark shadow-sm"
                : "text-text-secondary"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => { setTab("phone"); setError(""); setOtp(""); setOtpSent(false); }}
            className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all ${
              tab === "phone"
                ? "bg-accent text-brand-dark shadow-sm"
                : "text-text-secondary"
            }`}
          >
            Phone
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-2xl bg-red-50 px-4 py-2.5 text-xs text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {tab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-dark">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[12px] border border-border-default px-4 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-dark">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[12px] border border-border-default px-4 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-brand-dark disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {tab === "phone" && (
          <form onSubmit={handleOtpLogin} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-dark">Phone Number</label>
              <div className="flex">
                <div className="flex items-center rounded-l-[12px] border border-r-0 border-border-default bg-surface-alt px-3 py-2.5 text-xs font-medium text-text-primary">
                  <span className="mr-1">🇳🇵</span> +977
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full rounded-r-[12px] border border-border-default px-3 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                  placeholder="98XXXXXXXX"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length < 10}
              className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-brand-dark disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In with Phone"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { initialStep: "details" } }))}
            className="font-semibold text-brand-dark bg-transparent border-none p-0 cursor-pointer"
          >
            Sign Up
          </button>
        </p>
      </div>
  );
}
