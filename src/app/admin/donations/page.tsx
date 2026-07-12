"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";

interface Donation {
  id: number;
  name: string;
  email: string;
  amount: number;
  status: string;
  message: string;
  screenshot_url: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchDonations = () => {
    fetch("/api/admin/donations")
      .then((r) => r.json())
      .then((data) => {
        setDonations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const filtered = filter === "all" ? donations : donations.filter((d) => d.status === filter);

  const handleStatus = async (id: number, status: string) => {
    setActionLoading(id);
    await fetch("/api/admin/donations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setDonations((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
    setActionLoading(null);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign size={28} className="text-pink-500" />
            Donations
          </h1>
          <p className="text-gray-500 mt-1">Verify and manage donation payments</p>
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "verified", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "pending" && (
                <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {donations.filter((d) => d.status === "pending").length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 py-20 text-center">Loading donations...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-400 py-20 text-center">No donations found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((donation) => (
            <div key={donation.id} className="bg-white rounded-[16px] border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <DollarSign size={20} className="text-pink-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{donation.name}</h3>
                      <p className="text-sm text-gray-500">{donation.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[donation.status] || ""}`}>
                      {donation.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-900">Rs {donation.amount}</span>
                    <span className="text-sm text-gray-400">{new Date(donation.created_at).toLocaleDateString()}</span>
                  </div>
                  {donation.message && (
                    <p className="mt-2 text-sm text-gray-600 italic">&ldquo;{donation.message}&rdquo;</p>
                  )}
                  {donation.screenshot_url && (
                    <div className="mt-3">
                      <button
                        onClick={() => setPreviewImage(donation.screenshot_url)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ImageIcon size={16} />
                        View payment screenshot
                      </button>
                    </div>
                  )}
                  {donation.status === "pending" && (
                    <div className="mt-4 flex gap-2">
                      <button
                        disabled={actionLoading === donation.id}
                        onClick={() => handleStatus(donation.id, "verified")}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={16} />
                        {actionLoading === donation.id ? "Processing..." : "Verify"}
                      </button>
                      <button
                        disabled={actionLoading === donation.id}
                        onClick={() => handleStatus(donation.id, "rejected")}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-8"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[80vh] bg-white rounded-[16px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 z-10"
            >
              <XCircle size={18} />
            </button>
            <img src={previewImage} alt="Payment screenshot" className="max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
