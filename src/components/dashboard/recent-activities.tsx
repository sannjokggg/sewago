"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";

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

const typeFilters = ["All", "Marketplace", "Offers", "Events", "Donations"] as const;
const statusFilters = ["All", "Listed", "Pending", "Accepted", "Registered", "Donated"] as const;

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    fetch("/api/dashboard/activities")
      .then((res) => res.json())
      .then((data) => {
        if (data.activities) setActivities(data.activities);
      })
      .catch(console.error);
  }, []);

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

  const filteredActivities = useMemo(() => {
    return activities.filter((row) => {
      const desc = getDescription(row);
      const matchesSearch = !searchQuery || desc.toLowerCase().includes(searchQuery.toLowerCase()) || row.user.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "All" || row.type === typeFilter.slice(0, -1).toLowerCase() || (typeFilter === "Marketplace" && row.type === "post") || (typeFilter === "Donations" && row.type === "donation");
      const matchesStatus = statusFilter === "All" || row.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [activities, searchQuery, typeFilter, statusFilter]);

  return (
    <div className="flex h-full flex-col rounded-[24px] bg-surface p-6 shadow-sm max-h-[452px]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-text-muted">Recent Activities</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-52 rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-text-secondary placeholder:text-text-muted focus:border-[#B8F25E] focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                <X size={12} />
              </button>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={16} />
              <span>Filter</span>
              {(typeFilter !== "All" || statusFilter !== "All") && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B8F25E] text-xs font-bold text-text-primary">
                  {(typeFilter !== "All" ? 1 : 0) + (statusFilter !== "All" ? 1 : 0)}
                </span>
              )}
            </button>
            {showFilters && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-[12px] border border-border-light bg-surface p-4 shadow-lg">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Type</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {typeFilters.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          typeFilter === t
                            ? "bg-[#B8F25E] text-text-primary"
                            : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Status</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {statusFilters.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          statusFilter === s
                            ? "bg-[#B8F25E] text-text-primary"
                            : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => { setTypeFilter("All"); setStatusFilter("All"); }}
                      className="flex-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-gray-50"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 rounded-full bg-[#B8F25E] px-3 py-1.5 text-xs font-semibold text-text-primary"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex-1 overflow-auto">
        {/* Desktop table */}
        <table className="w-full text-left text-sm hidden sm:table">
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
            {filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted">
                  No activities match your filters
                </td>
              </tr>
            ) : (
              filteredActivities.map((row) => (
                <tr key={row.id} className="border-t border-border-light">
                  <td className="py-4 pr-4 font-mono text-xs font-semibold text-text-secondary">{shortId(row.id)}</td>
                  <td className="py-4 pr-8">
                    <div className="flex items-center gap-2.5">
                      <span className="font-medium text-text-primary">{getDescription(row)}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-6 text-text-secondary">{row.user}</td>
                  <td className="py-4 pr-6">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status] || "bg-gray-100 text-gray-600"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 text-xs text-text-secondary whitespace-nowrap">{formatDateTime(row.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile card list */}
        <div className="sm:hidden space-y-2">
          {filteredActivities.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-xs">
              No activities match your filters
            </div>
          ) : (
            filteredActivities.map((row) => (
              <div key={row.id} className="rounded-xl border border-border-light bg-surface-alt p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-text-primary truncate">{getDescription(row)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[9px] text-text-muted">{row.user}</span>
                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${statusStyles[row.status] || "bg-gray-100 text-gray-600"}`}>
                        {row.status}
                      </span>
                    </div>
                  </div>
                  <span className="text-[8px] text-text-muted whitespace-nowrap">{formatDateTime(row.date)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/dashboard/activities"
          className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
        >
          Show all activities →
        </Link>
      </div>
    </div>
  );
}
