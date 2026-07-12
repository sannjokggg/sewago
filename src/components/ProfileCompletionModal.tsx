"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileCompletionModal({ isOpen, onClose }: ProfileCompletionModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [idCardPreview, setIdCardPreview] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const idCardInputRef = useRef<HTMLInputElement>(null);

  const inputClass = "w-full rounded-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 text-text-primary bg-surface";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      setError("Session expired. Please refresh.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("dob", dob);
      formData.append("address", address);
      if (profilePhotoFile) formData.append("profilePhoto", profilePhotoFile);
      if (idCardFile) formData.append("idCard", idCardFile);

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

      router.refresh();
      onClose();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto thin-scrollbar rounded-[28px] bg-surface p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-alt border border-border-default flex items-center justify-center text-text-primary hover:bg-border-light transition-colors z-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-dark">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-brand-dark mb-1">Complete Your Profile</h2>
          <p className="text-sm text-text-muted">
            Tell us about yourself to finish setting up
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
