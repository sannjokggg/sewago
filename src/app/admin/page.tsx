"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Shield,
  DollarSign,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  pendingVerifications: number;
  totalPosts: number;
  totalDonations: number;
}

interface PendingUser {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  profile_photo: string;
  id_card_url: string;
  created_at: string;
}

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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/verify-user").then((r) => r.json()),
      fetch("/api/admin/donations").then((r) => r.json()),
    ])
      .then(([statsData, usersData, donationsData]) => {
        setStats(statsData);
        setPendingUsers(
          Array.isArray(usersData)
            ? usersData.filter((u: PendingUser & { verification_status: string }) => u.verification_status === "pending")
            : []
        );
        setDonations(Array.isArray(donationsData) ? donationsData.slice(0, 10) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleVerify = async (userId: number) => {
    setActionLoading(userId);
    await fetch("/api/admin/verify-user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "verify" }),
    });
    setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    setStats((prev) => prev ? { ...prev, pendingVerifications: prev.pendingVerifications - 1, totalUsers: prev.totalUsers } : prev);
    setActionLoading(null);
  };

  const handleDonationStatus = async (id: number, status: string) => {
    setActionLoading(id);
    await fetch("/api/admin/donations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setDonations((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
    setActionLoading(null);
  };

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-blue-500" },
    { label: "Pending Verifications", value: stats?.pendingVerifications ?? 0, icon: Clock, color: "bg-amber-500" },
    { label: "Total Posts", value: stats?.totalPosts ?? 0, icon: FileText, color: "bg-green-500" },
    { label: "Total Donations", value: stats?.totalDonations ?? 0, icon: Heart, color: "bg-pink-500" },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <Shield size={28} className="text-amber-500" />
        Admin Dashboard
      </h1>

      {loading ? (
        <div className="text-gray-400 py-20 text-center">Loading...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500 font-medium">{card.label}</span>
                    <div className={`${card.color} text-white rounded-full p-2`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Verifications */}
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={18} className="text-amber-500" />
                  Pending Verifications
                </h2>
                <Link href="/admin/verify" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  View all <ChevronRight size={14} />
                </Link>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {pendingUsers.length === 0 ? (
                  <div className="px-6 py-10 text-center text-gray-400 text-sm">No pending verifications</div>
                ) : (
                  pendingUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center gap-4 px-6 py-3 border-b border-gray-50 last:border-0">
                      <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        {user.profile_photo ? (
                          <img src={user.profile_photo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold">
                            {(user.name || "?")[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email || user.phone_number}</div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          disabled={actionLoading === user.id}
                          onClick={() => handleVerify(user.id)}
                          className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <Link
                          href="/admin/verify"
                          className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                        >
                          <XCircle size={16} />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Donations */}
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign size={18} className="text-pink-500" />
                  Recent Donations
                </h2>
                <Link href="/admin/donations" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  View all <ChevronRight size={14} />
                </Link>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {donations.length === 0 ? (
                  <div className="px-6 py-10 text-center text-gray-400 text-sm">No donations yet</div>
                ) : (
                  donations.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="flex items-center gap-4 px-6 py-3 border-b border-gray-50 last:border-0">
                      <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <DollarSign size={16} className="text-pink-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{donation.name}</div>
                        <div className="text-xs text-gray-500">Rs {donation.amount}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        donation.status === "verified" ? "bg-green-100 text-green-700" :
                        donation.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {donation.status}
                      </span>
                      {donation.status === "pending" && (
                        <div className="flex gap-1">
                          <button
                            disabled={actionLoading === donation.id}
                            onClick={() => handleDonationStatus(donation.id, "verified")}
                            className="h-7 w-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            disabled={actionLoading === donation.id}
                            onClick={() => handleDonationStatus(donation.id, "rejected")}
                            className="h-7 w-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
