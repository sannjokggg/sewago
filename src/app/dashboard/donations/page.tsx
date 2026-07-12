"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, ExternalLink, Shield } from "lucide-react";

interface Donation {
  id: number;
  user_id: number | null;
  name: string;
  email: string;
  amount: string;
  message: string | null;
  screenshot_url: string | null;
  status: string;
  created_at: string;
}

export default function DonationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch("/api/donations")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDonations(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  const updateStatus = async (id: number, newStatus: string) => {
    await fetch("/api/donations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    setDonations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
  };

  const filtered = filter === "all" ? donations : donations.filter((d) => d.status === filter);

  if (status === "loading" || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} className="text-text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">Donations</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {["pending", "verified", "rejected", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              filter === f
                ? "bg-[#1D1B17] text-white shadow-sm"
                : "bg-surface text-text-secondary hover:bg-border-light"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-surface py-20 shadow-sm">
          <Shield size={48} strokeWidth={1} className="text-text-muted" />
          <p className="mt-4 text-lg font-medium text-text-muted">No donations found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((donation) => (
            <div
              key={donation.id}
              className="rounded-[24px] bg-surface p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
                    {donation.name[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-text-primary">{donation.name}</p>
                    <p className="text-sm text-text-muted">{donation.email}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  donation.status === "verified" ? "bg-green-100 text-green-700" :
                  donation.status === "rejected" ? "bg-red-100 text-red-600" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {donation.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-[14px] bg-surface-alt p-3">
                  <p className="text-xs text-text-muted">Amount</p>
                  <p className="text-lg font-bold text-text-primary">Rs {donation.amount}</p>
                </div>
                <div className="rounded-[14px] bg-surface-alt p-3">
                  <p className="text-xs text-text-muted">Date</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </p>
                </div>
                {donation.message && (
                  <div className="rounded-[14px] bg-surface-alt p-3 col-span-3">
                    <p className="text-xs text-text-muted">Message</p>
                    <p className="text-sm text-text-secondary">{donation.message}</p>
                  </div>
                )}
              </div>

              {donation.screenshot_url && (
                <div className="mt-4">
                  <p className="text-xs text-text-muted mb-2">Payment Screenshot</p>
                  <a
                    href={donation.screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[12px] border border-border-default bg-surface-alt px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <ExternalLink size={14} />
                    View Screenshot
                  </a>
                </div>
              )}

              {donation.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateStatus(donation.id, "verified")}
                    className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors"
                  >
                    <Check size={15} /> Verify
                  </button>
                  <button
                    onClick={() => updateStatus(donation.id, "rejected")}
                    className="flex items-center gap-1.5 rounded-full border border-border-default px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <X size={15} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
