"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

interface Activity {
  id: string;
  name: string;
  user: string;
  icon: string;
  status: string;
  date: string;
  type: string;
}

const statusStyles: Record<string, string> = {
  Listed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Accepted: "bg-blue-100 text-blue-700",
  Rejected: "bg-red-100 text-red-600",
  Registered: "bg-purple-100 text-purple-700",
  Donated: "bg-pink-100 text-pink-700",
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/activities?all=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.activities) setActivities(data.activities);
      })
      .catch(console.error);
  }, []);

  const filtered = activities.filter((row) => {
    const desc = getDescription(row);
    return !searchQuery || desc.toLowerCase().includes(searchQuery.toLowerCase()) || row.user.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getDescription = (row: Activity) => {
    if (row.type === "post") return `Added "${row.name}" in Marketplace`;
    if (row.type === "offer") return `Made an offer on "${row.name}"`;
    if (row.type === "event") return `Registered for "${row.name}"`;
    if (row.type === "donation") return row.name;
    return row.name;
  };

  const shortId = (id: string) => {
    const num = id.split("-").pop() || "0";
    const hex = parseInt(num, 10).toString(16).toUpperCase().padStart(3, "0");
    return `#${hex}`;
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col gap-6 py-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-border-light hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} className="text-text-secondary" />
        </Link>
        <h1 className="text-3xl lg:text-5xl font-normal text-text-primary">All Activities</h1>
      </div>

      <div className="rounded-[24px] bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border-default bg-surface-alt py-2 pl-9 pr-4 text-sm text-text-secondary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>
          <span className="text-sm text-text-muted">{filtered.length} activities</span>
        </div>

        <div className="mt-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-text-muted text-xs uppercase tracking-wider">
                <th className="pb-4 pr-4 font-medium">ID</th>
                <th className="pb-4 pr-8 font-medium">Activity</th>
                <th className="pb-4 pr-6 font-medium">User</th>
                <th className="pb-4 pr-6 font-medium">Status</th>
                <th className="pb-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    No activities found
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-border-light">
                    <td className="py-4 pr-4 font-mono text-xs font-semibold text-text-secondary">{shortId(row.id)}</td>
                    <td className="py-4 pr-8">
                      <div className="flex items-center gap-2.5">
                        <span className="font-medium text-text-primary">{getDescription(row)}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-text-secondary">{row.user}</td>
                    <td className="py-4 pr-6">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status] || "bg-border-light text-text-secondary"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-text-secondary whitespace-nowrap">{formatDateTime(row.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
