"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/OtpInput";
import { ImagePlus, X, Mail, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";

type Step = "welcome" | "phone" | "otp" | "details" | "email";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
  initialStep?: Step;
}

export default function AuthPopup({ isOpen, onClose, redirectTo, initialStep }: AuthPopupProps) {
  const router = useRouter();
  const targetUrl = redirectTo || "/dashboard";
  const [step, setStep] = useState<Step>("welcome");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [emailMode, setEmailMode] = useState<"signin" | "signup">("signin");
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);

  // Email OTP states
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [emailOtpExpiresAt, setEmailOtpExpiresAt] = useState<string | null>(null);
  const [otpError, setOtpError] = useState("");

  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [idCardPreview, setIdCardPreview] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const idCardInputRef = useRef<HTMLInputElement>(null);
  const { data: session, status } = useSession();
  const [isGoogleCompletion, setIsGoogleCompletion] = useState(false);

  useEffect(() => {
    if (isOpen && status === "authenticated" && session?.user) {
      handleClose();
    }
  }, [isOpen, status, session]);

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

  // Email OTP countdown
  useEffect(() => {
    if (!emailOtpExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(emailOtpExpiresAt).getTime() - Date.now()) / 1000)
      );
      setOtpCountdown(remaining);
      if (remaining <= 0) {
        setEmailOtpSent(false);
        setEmailOtpExpiresAt(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [emailOtpExpiresAt]);

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep || "welcome");
      setIsGoogleCompletion(initialStep === "details");
      setPhoneNumber("");
      setOtp("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setDob("");
      setAddress("");
      setEmailMode("signin");
      setOtpSent(false);
      setOtpExpiresAt(null);
      setError("");
      setLoading(false);
      setNewUserId(null);
      setProfilePhotoPreview("");
      setIdCardPreview("");
      setProfilePhotoFile(null);
      setIdCardFile(null);
      setEmailOtpSent(false);
      setEmailVerified(false);
      setEmailOtp("");
      setEmailOtpExpiresAt(null);
      setOtpError("");
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

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
      setEmailOtpExpiresAt(data.expiresAt);
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
      setEmailVerified(true);
      setOtpLoading(false);
    } catch {
      setOtpError("Something went wrong");
      setOtpLoading(false);
    }
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNumber", phoneNumber ? `+977${phoneNumber}` : "");
    formData.append("dob", dob);
    formData.append("address", address);
    if (profilePhotoFile) formData.append("profilePhoto", profilePhotoFile);
    if (idCardFile) formData.append("idCard", idCardFile);
    return formData;
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: targetUrl });
    } catch {
      setError("Google sign-in failed");
      setLoading(false);
    }
  };

  const handlePhoneSubmit = () => {
    setError("");
    if (phoneNumber.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setStep("details");
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
      setStep("otp");
      setLoading(false);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fullPhone = `+977${phoneNumber}`;

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: fullPhone, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      setNewUserId(data.user.id);
      setFirstName("");
      setLastName("");
      setEmail(data.user.email || "");

      if (data.user.name && data.user.name !== "User" && data.user.email) {
        const result = await signIn("credentials", {
          phone: fullPhone,
          otp,
          redirect: false,
        });
        if (result?.error) {
          setError(result.error);
          setLoading(false);
        } else {
          router.push(targetUrl);
          router.refresh();
          handleClose();
        }
      } else {
        setStep("details");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleCompleteDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fullPhone = `+977${phoneNumber}`;

    try {
      if (isGoogleCompletion) {
        const userId = (session?.user as { id?: string })?.id;
        if (!userId) {
          setError("User not found");
          setLoading(false);
          return;
        }
        
        const formData = buildFormData();
        formData.append("userId", userId);
        
        const res = await fetch("/api/auth/update-profile", {
          method: "POST",
          body: formData,
        });
        
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to update profile");
          setLoading(false);
          return;
        }
        
        router.push(targetUrl);
        router.refresh();
        handleClose();
      } else {
        const formData = buildFormData();
        formData.set("phoneNumber", fullPhone);
        
        const res = await fetch("/api/auth/register-phone", {
          method: "POST",
          body: formData,
        });
        
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed");
          setLoading(false);
          return;
        }
        
        const result = await signIn("credentials", {
          phone: fullPhone,
          redirect: false,
        });
        
        if (result?.error) {
          setError(result.error);
          setLoading(false);
        } else {
          router.push(targetUrl);
          router.refresh();
          handleClose();
        }
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (emailMode === "signup") {
        if (email && !emailVerified) {
          setError("Please verify your email address first");
          setLoading(false);
          return;
        }

        const formData = buildFormData();
        const res = await fetch("/api/register", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push(targetUrl);
        router.refresh();
        handleClose();
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp("");
    setOtpSent(false);
    setOtpExpiresAt(null);
    handleSendOtp();
  };

  const inputClass = "w-full rounded-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 text-text-primary bg-surface";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto thin-scrollbar rounded-[28px] bg-surface p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-alt border border-border-default flex items-center justify-center text-text-primary hover:bg-border-light transition-colors z-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100 text-center">
            {error}
          </div>
        )}

        {step === "welcome" && (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-dark">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-brand-dark mb-1">
              Start Your Journey
            </h2>
            <p className="text-base text-text-secondary mb-1">
              with <span className="font-bold text-accent">SewaGo</span>
            </p>
            <p className="text-sm text-text-muted mb-8">
              Join our community and make a difference for our planet.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-full border border-border-default bg-surface px-4 py-3.5 text-base font-semibold text-text-primary transition-all hover:bg-surface-alt disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => {
                  setEmailMode("signin");
                  setStep("email");
                }}
                className="w-full flex items-center justify-center gap-3 rounded-full border border-border-default bg-surface px-4 py-3.5 text-base font-semibold text-text-primary transition-all hover:bg-surface-alt disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Continue with Email
              </button>

              <button
                onClick={() => setStep("phone")}
                className="w-full flex items-center justify-center gap-3 rounded-full border border-border-default bg-surface px-4 py-3.5 text-base font-semibold text-text-primary transition-all hover:bg-surface-alt disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                Continue with Phone
              </button>
            </div>

            <div className="mt-5 text-center text-sm text-text-secondary">
              New here?{" "}
              <button
                type="button"
                onClick={() => {
                  setEmailMode("signup");
                  setStep("email");
                  setError("");
                }}
                className="font-semibold text-brand-dark hover:text-accent transition-colors"
              >
                Sign Up
              </button>
            </div>

            <p className="mt-5 text-xs text-text-muted">
              By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        )}

        {step === "email" && (
          <div>
            <button
              onClick={() => { setStep("welcome"); setError(""); }}
              className="mb-6 flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors font-semibold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            <div className="flex border border-border-default rounded-full overflow-hidden mb-6 p-1 bg-surface-alt">
              <button
                type="button"
                onClick={() => { setEmailMode("signin"); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${
                  emailMode === "signin"
                    ? "bg-accent text-brand-dark shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setEmailMode("signup"); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${
                  emailMode === "signup"
                    ? "bg-accent text-brand-dark shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Sign Up
              </button>
            </div>

            <h2 className="text-2xl font-bold text-brand-dark mb-1">
              {emailMode === "signin" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-text-muted mb-6">
              {emailMode === "signin"
                ? "Sign in with your email and password"
                : "Fill in your details to create an account"}
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {emailMode === "signup" && (
                <>
                  <div className="flex flex-col items-center mb-2">
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
                          className="h-20 w-20 rounded-full object-cover border-[3px] border-accent"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProfilePhotoPreview("");
                            setProfilePhotoFile(null);
                            if (profileInputRef.current) profileInputRef.current.value = "";
                          }}
                          className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => profileInputRef.current?.click()}
                        className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed border-border-default bg-surface-alt transition-all hover:border-accent hover:bg-accent/5"
                      >
                        <ImagePlus size={20} strokeWidth={1.5} className="text-text-muted" />
                        <span className="text-[10px] font-medium text-text-muted">Photo</span>
                      </button>
                    )}
                    <p className="mt-1 text-[11px] text-text-muted">Profile photo</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-brand-dark">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={inputClass}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={inputClass}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Email Address</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailVerified(false);
                      setEmailOtpSent(false);
                      setEmailOtp("");
                      setOtpError("");
                    }}
                    className={`${inputClass} flex-1`}
                    placeholder="name@example.com"
                    required
                    disabled={emailMode === "signin" || emailVerified}
                  />
                  {emailMode === "signup" && email && !emailVerified && !emailOtpSent && (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={otpLoading || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                      className="flex items-center gap-2 rounded-[12px] bg-brand-dark px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-dark/90 disabled:opacity-50 whitespace-nowrap"
                    >
                      {otpLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                      Send Code
                    </button>
                  )}
                  {emailMode === "signup" && emailVerified && (
                    <div className="flex items-center gap-2 rounded-[12px] bg-green-50 border border-green-200 px-4 py-3 text-sm font-semibold text-green-700">
                      <CheckCircle size={16} />
                      Verified
                    </div>
                  )}
                </div>

                {emailMode === "signup" && emailOtpSent && !emailVerified && (
                  <div className="mt-3 rounded-[12px] border border-border-default bg-surface-alt p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => { setEmailOtpSent(false); setEmailOtp(""); setOtpError(""); }}
                        className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <ArrowLeft size={14} />
                        Change email
                      </button>
                      <span className="text-xs text-text-muted">|</span>
                      <span className="text-xs text-text-muted">Code sent to {email}</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="flex-1 rounded-[10px] border border-border-default px-3 py-2.5 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary text-center tracking-[6px] font-mono"
                        placeholder="000000"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        disabled={otpLoading || emailOtp.length !== 6}
                        className="flex items-center gap-1.5 rounded-[10px] bg-accent px-4 py-2.5 text-sm font-semibold text-brand-dark transition-all hover:bg-accent-hover disabled:opacity-50"
                      >
                        {otpLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        Verify
                      </button>
                    </div>
                    {otpError && (
                      <p className="mt-2 text-xs text-red-500">{otpError}</p>
                    )}
                    <div className="mt-2 text-center">
                      {otpCountdown > 0 ? (
                        <p className="text-xs text-text-muted">
                          Resend in {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, "0")}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          className="text-xs font-semibold text-brand-dark hover:text-accent transition-colors"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                  required
                />
              </div>

              {emailMode === "signup" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Phone Number</label>
                    <div className="flex">
                      <div className="flex items-center rounded-l-[12px] border border-r-0 border-border-default bg-surface-alt px-4 py-3 text-base font-medium text-text-primary">
                        <span className="mr-1">🇳🇵</span> +977
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="w-full rounded-r-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 text-text-primary bg-surface"
                        placeholder="98XXXXXXXX"
                        readOnly={!!phoneNumber}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 text-text-primary bg-surface resize-none"
                      placeholder="Street address, city, district..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Valid ID Card</label>
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
                            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-red-50 text-red-500 text-xs font-bold">PDF</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate">{idCardFile?.name}</p>
                              <p className="text-xs text-text-muted">PDF document</p>
                            </div>
                          </div>
                        ) : (
                          <img src={idCardPreview} alt="ID preview" className="h-24 w-full rounded-[12px] object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setIdCardPreview("");
                            setIdCardFile(null);
                            if (idCardInputRef.current) idCardInputRef.current.value = "";
                          }}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => idCardInputRef.current?.click()}
                        className="flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-border-default bg-surface-alt px-4 py-4 transition-all hover:border-accent hover:bg-accent/5"
                      >
                        <ImagePlus size={18} strokeWidth={1.5} className="text-text-muted" />
                        <span className="text-sm font-medium text-text-muted">Upload ID Card</span>
                      </button>
                    )}
                    <p className="mt-1 text-[11px] text-text-muted">Passport, National ID, Driving License (Image or PDF)</p>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading || (emailMode === "signup" && !!email && !emailVerified)}
                className="w-full rounded-full bg-accent px-4 py-3.5 text-base font-semibold text-brand-dark transition-all hover:bg-accent-hover hover:shadow-md disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : emailMode === "signin"
                  ? "Sign In"
                  : email && !emailVerified
                  ? "Verify email to continue"
                  : "Sign Up & Continue"}
              </button>
              {emailMode === "signup" && email && !emailVerified && (
                <p className="text-center text-xs text-amber-600">
                  Please verify your email address to complete registration
                </p>
              )}
            </form>
          </div>
        )}

        {step === "phone" && (
          <div>
            <button
              onClick={() => { setStep("welcome"); setError(""); }}
              className="mb-6 flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors font-semibold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            <h2 className="text-2xl font-bold text-brand-dark mb-1">Enter your phone</h2>
            <p className="text-sm text-text-muted mb-6">
              Enter your phone number to get started
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handlePhoneSubmit(); }} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Phone Number</label>
                <div className="flex">
                  <div className="flex items-center rounded-l-[12px] border border-r-0 border-border-default bg-surface-alt px-4 py-3 text-base font-medium text-text-primary">
                    <span className="mr-1">🇳🇵</span> +977
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full rounded-r-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 text-text-primary bg-surface"
                    placeholder="98XXXXXXXX"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length < 10}
                className="w-full rounded-full bg-accent px-4 py-3.5 text-base font-semibold text-brand-dark transition-all hover:bg-accent-hover hover:shadow-md disabled:opacity-50"
              >
                {loading ? "Processing..." : "Continue"}
              </button>
            </form>
          </div>
        )}

        {step === "otp" && (
          <div>
            <button
              onClick={() => { setStep("phone"); setOtp(""); setOtpSent(false); setOtpExpiresAt(null); setError(""); }}
              className="mb-6 flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors font-semibold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            <h2 className="text-2xl font-bold text-brand-dark mb-1">Verify your number</h2>
            <p className="text-sm text-text-muted mb-6">
              Enter the 6-digit code sent to <span className="font-medium text-text-primary">+977{phoneNumber}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <OtpInput length={6} value={otp} onChange={setOtp} disabled={loading} />

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-xs text-text-muted">
                    Resend OTP in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-xs font-semibold text-brand-dark hover:text-accent transition-colors"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-full bg-accent px-4 py-3.5 text-base font-semibold text-brand-dark transition-all hover:bg-accent-hover hover:shadow-md disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>
          </div>
        )}

        {step === "details" && (
          <div>
            <button
              onClick={() => { setStep("phone"); setError(""); }}
              className="mb-6 flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors font-semibold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            <h2 className="text-2xl font-bold text-brand-dark mb-1">Complete Your Profile</h2>
            <p className="text-sm text-text-muted mb-6">
              Tell us about yourself to finish setting up
            </p>

            <form onSubmit={handleCompleteDetails} className="space-y-4">
              <div className="flex flex-col items-center mb-2">
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
                      className="h-20 w-20 rounded-full object-cover border-[3px] border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProfilePhotoPreview("");
                        setProfilePhotoFile(null);
                        if (profileInputRef.current) profileInputRef.current.value = "";
                      }}
                      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed border-border-default bg-surface-alt transition-all hover:border-accent hover:bg-accent/5"
                  >
                    <ImagePlus size={20} strokeWidth={1.5} className="text-text-muted" />
                    <span className="text-[10px] font-medium text-text-muted">Photo</span>
                  </button>
                )}
                <p className="mt-1 text-[11px] text-text-muted">Your profile photo</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-brand-dark">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                    placeholder="John"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 text-text-primary bg-surface resize-none"
                  placeholder="Street address, city, district..."
                  rows={2}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Valid ID Card</label>
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-red-50 text-red-500 text-xs font-bold">PDF</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{idCardFile?.name}</p>
                          <p className="text-xs text-text-muted">PDF document</p>
                        </div>
                      </div>
                    ) : (
                      <img src={idCardPreview} alt="ID preview" className="h-24 w-full rounded-[12px] object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIdCardPreview("");
                        setIdCardFile(null);
                        if (idCardInputRef.current) idCardInputRef.current.value = "";
                      }}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => idCardInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-border-default bg-surface-alt px-4 py-4 transition-all hover:border-accent hover:bg-accent/5"
                  >
                    <ImagePlus size={18} strokeWidth={1.5} className="text-text-muted" />
                    <span className="text-sm font-medium text-text-muted">Upload ID Card</span>
                  </button>
                )}
                <p className="mt-1 text-[11px] text-text-muted">Passport, National ID, Driving License (Image or PDF)</p>
              </div>

              <button
                type="submit"
                disabled={loading || !firstName.trim() || !lastName.trim() || !email.trim()}
                className="w-full rounded-full bg-accent px-4 py-3.5 text-base font-semibold text-brand-dark transition-all hover:bg-accent-hover hover:shadow-md disabled:opacity-50"
              >
                {loading 
                  ? (isGoogleCompletion ? "Saving..." : "Setting up...") 
                  : (isGoogleCompletion ? "Save & Continue" : "Start My Journey")
                }
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
