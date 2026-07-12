"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImagePlus, X, Mail, CheckCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [idCardPreview, setIdCardPreview] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email OTP states for post-submit verification screen
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [otpError, setOtpError] = useState("");
  const pendingFormRef = useRef<FormData | null>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const idCardInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!otpExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(otpExpiresAt).getTime() - Date.now()) / 1000)
      );
      setOtpCountdown(remaining);
      if (remaining <= 0) {
        setOtpExpiresAt(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  const handleProfilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be under 5MB.");
      return;
    }
    setError("");
    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
  };

  const handleIdCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("ID card file must be under 10MB.");
      return;
    }
    setError("");
    setIdCardFile(file);
    setIdCardPreview(URL.createObjectURL(file));
  };

  const handleSendEmailOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setOtpError("Please enter a valid email address");
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Failed to send code");
        setOtpLoading(false);
        return;
      }
      setEmailOtpSent(true);
      setOtpExpiresAt(data.expiresAt);
      setOtpLoading(false);
    } catch {
      setOtpError("Something went wrong");
      setOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: emailOtp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Verification failed");
        setOtpLoading(false);
        return;
      }
      setOtpLoading(false);
      // OTP verified — now submit the registration
      await submitRegistration();
    } catch {
      setOtpError("Something went wrong");
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNumber", phoneNumber);
    formData.append("dob", dob);
    formData.append("address", address);
    if (profilePhotoFile) formData.append("profilePhoto", profilePhotoFile);
    if (idCardFile) formData.append("idCard", idCardFile);
    pendingFormRef.current = formData;

    // Send OTP and show verification screen
    setShowOtpScreen(true);
    await handleSendEmailOtp();
  };

  const submitRegistration = async () => {
    const fd = pendingFormRef.current;
    if (!fd) return;
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      if (email && password) {
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
      } else {
        router.push("/login");
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };


  
  return (
    <>
    <div className="w-full max-w-5xl rounded-[28px] bg-surface p-6 shadow-2xl">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-brand-dark">Create Account</h1>
          <p className="mt-1 text-xs text-text-secondary">Join the SewaGo community</p>
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
          <span className="relative bg-surface px-4 text-sm text-text-muted">or fill in your details</span>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-3 rounded-2xl bg-red-50 px-4 py-2.5 text-xs text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center mb-1">
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePhoto}
              className="hidden"
            />
            {profilePhotoPreview ? (
              <div className="relative">
                <img
                  src={profilePhotoPreview}
                  alt="Profile preview"
                  className="h-16 w-16 rounded-full object-cover border-[3px] border-accent"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProfilePhotoPreview("");
                    setProfilePhotoFile(null);
                    if (profileInputRef.current) profileInputRef.current.value = "";
                  }}
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-dashed border-border-default bg-surface-alt"
              >
                <ImagePlus size={16} strokeWidth={1.5} className="text-text-muted" />
                <span className="text-[8px] font-medium text-text-muted">Photo</span>
              </button>
            )}
            <p className="mt-1.5 text-xs text-text-muted">Your profile photo</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-dark">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-[12px] border border-border-default px-4 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-dark">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-[12px] border border-border-default px-4 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-dark">Phone Number</label>
                  <div className="flex">
                    <div className="flex items-center rounded-l-[12px] border border-r-0 border-border-default bg-surface-alt px-3 py-2.5 text-sm font-medium text-text-primary">
                      <span className="mr-1">🇳🇵</span> +977
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full rounded-r-[12px] border border-border-default px-3 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                      placeholder="98XXXXXXXX"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-dark">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full rounded-[12px] border border-border-default px-3 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-dark">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[12px] border border-border-default px-4 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="mb-1 block text-xs font-semibold text-brand-dark">Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-[12px] border border-border-default px-4 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary resize-none"
                    placeholder="Street, city, district..."
                    rows={1}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-dark">Valid ID Card</label>
                <input
                  ref={idCardInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleIdCard}
                  className="hidden"
                />
                {idCardPreview ? (
                  <div className="relative rounded-[16px] border border-border-default p-3 bg-surface">
                    {idCardFile?.type === "application/pdf" ? (
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-red-50 text-red-500 text-xs font-bold">PDF</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{idCardFile?.name}</p>
                          <p className="text-xs text-text-muted">PDF document</p>
                        </div>
                      </div>
                    ) : (
                      <img src={idCardPreview} alt="ID preview" className="h-32 w-full rounded-[12px] object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIdCardPreview("");
                        setIdCardFile(null);
                        if (idCardInputRef.current) idCardInputRef.current.value = "";
                      }}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => idCardInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-border-default bg-surface-alt px-4 py-3"
                  >
                    <ImagePlus size={20} strokeWidth={1.5} className="text-text-muted" />
                    <span className="text-sm font-medium text-text-muted">Upload ID Card (Image or PDF)</span>
                  </button>
                )}
                <p className="mt-1 text-xs text-text-muted">Accepted: Passport, National ID, Driving License, etc.</p>
              </div>

              <button
                type="submit"
                disabled={loading || otpLoading}
                className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-brand-dark disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-2 text-center text-xs text-red-500">{error}</p>
          )}
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { initialStep: "email" } }))}
            className="font-semibold text-brand-dark bg-transparent border-none p-0 cursor-pointer"
          >
            Login
          </button>
        </p>
      </div>

      {/* OTP Verification Overlay */}
      {showOtpScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-surface p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-dark">
                <Mail size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-brand-dark">Verify Your Email</h2>
              <p className="mt-1 text-sm text-text-muted">
                Enter the code sent to <strong className="text-text-primary">{email}</strong>
              </p>
            </div>

            {!emailOtpSent && otpLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={32} className="animate-spin text-accent" />
              </div>
            ) : (
              <>
                <div className="flex justify-center gap-3 mb-1">
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full max-w-[280px] rounded-[14px] border border-border-default px-4 py-4 text-2xl text-center outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary tracking-[12px] font-mono"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <p className="text-center text-xs text-text-muted mb-5">6-digit code</p>

                {otpError && (
                  <p className="text-center text-xs text-red-500 mb-3">{otpError}</p>
                )}

                <button
                  onClick={handleVerifyEmailOtp}
                  disabled={otpLoading || emailOtp.length !== 6}
                  className="w-full rounded-full bg-accent px-4 py-3 text-sm font-semibold text-brand-dark disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {otpLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {otpLoading ? "Verifying..." : "Verify & Complete"}
                </button>

                <div className="mt-4 text-center">
                  {otpCountdown > 0 && emailOtpSent ? (
                    <p className="text-xs text-text-muted">
                      Code expires in {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, "0")}
                    </p>
                  ) : (
                    <button
                      onClick={handleSendEmailOtp}
                      disabled={otpLoading}
                      className="text-xs font-semibold text-brand-dark disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </>
            )}

            <button
              onClick={() => { setShowOtpScreen(false); setEmailOtpSent(false); setEmailOtp(""); setOtpError(""); }}
              className="mt-4 w-full text-center text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Go back
            </button>
          </div>
        </div>
      )}
    </>
  );
}
