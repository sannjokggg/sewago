"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  ChevronDown,
  ChevronUp,
  ImageIcon,
} from "lucide-react";

interface UserRecord {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  dob: string;
  address: string;
  id_card_url: string;
  profile_photo: string;
  verification_status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  verified: CheckCircle,
  rejected: XCircle,
};

export default function VerifyUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("pending");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

  const fetchUsers = () => {
    fetch("/api/admin/verify-user")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = filter === "all" ? users : users.filter((u) => u.verification_status === filter);

  const handleVerify = async (userId: number) => {
    setActionLoading(userId);
    await fetch("/api/admin/verify-user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "verify" }),
    });
    fetchUsers();
    setActionLoading(null);
  };

  const handleReject = async (userId: number) => {
    setActionLoading(userId);
    await fetch("/api/admin/verify-user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "reject", reason: rejectReason }),
    });
    fetchUsers();
    setActionLoading(null);
    setShowRejectModal(null);
    setRejectReason("");
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield size={28} className="text-amber-500" />
            Verify Users
          </h1>
          <p className="text-gray-500 mt-1">Review and verify user accounts</p>
        </div>
        <div className="flex gap-2">
          {(["pending", "all", "verified", "rejected"] as const).map((f) => (
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
                  {users.filter((u) => u.verification_status === "pending").length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 py-20 text-center">Loading users...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-400 py-20 text-center">No users found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => {
            const StatusIcon = statusIcons[user.verification_status] || Clock;
            const expanded = expandedId === user.id;
            return (
              <div key={user.id} className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : user.id)}
                >
                  <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {user.profile_photo ? (
                      <img src={user.profile_photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold text-lg">
                        {(user.first_name || user.name || "?")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {user.email || user.phone_number || "No contact"}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[user.verification_status] || ""}`}>
                    <StatusIcon size={14} />
                    {user.verification_status}
                  </span>
                  {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>

                {expanded && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</span>
                        <p className="text-gray-800 mt-0.5">{user.name}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</span>
                        <p className="text-gray-800 mt-0.5">{user.email || "—"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</span>
                        <p className="text-gray-800 mt-0.5">{user.phone_number || "—"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Date of Birth</span>
                        <p className="text-gray-800 mt-0.5">{user.dob || "—"}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Address</span>
                        <p className="text-gray-800 mt-0.5">{user.address || "—"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Registered</span>
                        <p className="text-gray-800 mt-0.5">{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-6 mb-5">
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">Profile Photo</span>
                        {user.profile_photo ? (
                          <a href={user.profile_photo} target="_blank" rel="noopener noreferrer" className="block">
                            <div className="h-40 w-40 rounded-[12px] overflow-hidden border border-gray-200 bg-white">
                              <img src={user.profile_photo} alt="Profile" className="h-full w-full object-cover" />
                            </div>
                          </a>
                        ) : (
                          <div className="h-40 w-40 rounded-[12px] border border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-400 text-sm">
                            <div className="text-center">
                              <ImageIcon size={24} className="mx-auto mb-1" />
                              No photo
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">ID Card</span>
                        {user.id_card_url ? (
                          <a href={user.id_card_url} target="_blank" rel="noopener noreferrer" className="block">
                            <div className="h-40 w-64 rounded-[12px] overflow-hidden border border-gray-200 bg-white">
                              <img src={user.id_card_url} alt="ID Card" className="h-full w-full object-cover" />
                            </div>
                          </a>
                        ) : (
                          <div className="h-40 w-64 rounded-[12px] border border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-400 text-sm">
                            <div className="text-center">
                              <ImageIcon size={24} className="mx-auto mb-1" />
                              No ID card
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {user.verification_status === "pending" && (
                      <div className="flex gap-3">
                        <button
                          disabled={actionLoading === user.id}
                          onClick={() => handleVerify(user.id)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          {actionLoading === user.id ? "Verifying..." : "Verify"}
                        </button>
                        <button
                          disabled={actionLoading === user.id}
                          onClick={() => setShowRejectModal(user.id)}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {showRejectModal === user.id && (
                  <div className="border-t border-gray-100 p-5 bg-red-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rejection reason (optional)</label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full rounded-[12px] border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200 mb-3"
                      placeholder="Why is this user being rejected?"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(user.id)}
                        disabled={actionLoading === user.id}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {actionLoading === user.id ? "Rejecting..." : "Confirm Reject"}
                      </button>
                      <button
                        onClick={() => { setShowRejectModal(null); setRejectReason(""); }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-full text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
