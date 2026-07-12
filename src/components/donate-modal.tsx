"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X, Loader2, ImagePlus, Check, ExternalLink } from "lucide-react";

interface DonateModalProps {
  onClose: () => void;
}

export default function DonateModal({ onClose }: DonateModalProps) {
  const { data: session } = useSession();
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as { name?: string; email?: string };
      if (user.name && !name) setName(user.name);
      if (user.email && !email) setEmail(user.email);
    }
  }, [session]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshot(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!name || !email || !amount || !screenshotFile) {
      setError("Please fill all required fields and upload payment screenshot");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      // Upload screenshot
      const formData = new FormData();
      formData.append("file", screenshotFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      const screenshotUrl = uploadData.url || null;

      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          amount: parseFloat(amount),
          message,
          screenshot_url: screenshotUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit donation");
        setSubmitting(false);
        return;
      }

      setStep("success");
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4" onClick={onClose}>
      <div className="relative w-full max-w-3xl sm:rounded-[24px] rounded-t-[24px] bg-white p-4 sm:p-5 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
        >
          <X size={16} />
        </button>

        {step === "success" ? (
          <div className="flex flex-col items-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-center text-gray-600 mb-6">
              Your donation has been submitted. We'll verify your payment and notify you once confirmed.
            </p>
            <button
              onClick={onClose}
              className="rounded-full bg-accent px-10 py-3 text-base font-semibold text-gray-900 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Make a Donation</h2>
            {error && (
              <div className="mb-3 rounded-[12px] border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
            )}

            <div className="flex flex-col sm:flex-row gap-5">
              {/* Left: Form Fields */}
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-800">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-[12px] border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-gray-300 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-800">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-[12px] border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-gray-300 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-800">Amount (Rs) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-[12px] border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-gray-300 focus:bg-white"
                    placeholder="e.g. 1000"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-800">Message (optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-[12px] border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-gray-300 focus:bg-white"
                    placeholder="Your kind words..."
                  />
                </div>

                {/* Screenshot Upload moved to left */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-800">Upload Payment Screenshot *</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {screenshot ? (
                    <div className="relative inline-block">
                      <img src={screenshot} alt="Screenshot preview" className="h-20 w-20 rounded-[10px] object-cover border border-gray-200" />
                      <button
                        onClick={() => { setScreenshot(null); setScreenshotFile(null); }}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:bg-gray-100"
                    >
                      <ImagePlus size={16} />
                      Choose file
                    </button>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {submitting ? "Submitting..." : "Submit Donation"}
                </button>
              </div>

              {/* Right: QR Code */}
              <div className="w-full sm:w-48 flex-shrink-0">
                <div className="rounded-[14px] bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-800 mb-2 text-center">Scan to Pay</p>
                  <img src="/uploads/qr.jpeg" alt="Payment QR" className="mx-auto h-40 w-40 object-contain rounded-[10px]" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
