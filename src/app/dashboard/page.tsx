"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Heart,
  Recycle,
  Handshake,
  Gift,
  Users,
  Calendar,
  X,
} from "lucide-react";
import IncomeChart from "@/components/income-chart";
import RecentActivities from "@/components/dashboard/recent-activities";
import AqiCard from "@/components/dashboard/aqi-card";
import DonateModal from "@/components/donate-modal";
import ThankYouPopup from "@/components/thank-you-popup";

export default function Dashboard() {
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] || "Guest";

  const [stats, setStats] = useState({
    itemsReused: 0,
    itemsChange: 0,
    donationsMade: 0,
    donationsChange: 0,
    peopleHelped: 0,
    peopleChange: 0,
    eventsJoined: 0,
    eventsChange: 0,
    totalContributions: 0,
    totalContributionsChange: 0,
    donationsSum: 0,
  });
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;
        setStats(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-4 lg:gap-6 py-1 lg:py-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div>
        <h1 className="text-xl lg:text-3xl font-normal text-text-primary">
          Good morning, {name}
        </h1>
      </div>

      {/* Row 1: Community Impact + Stats + Chart (side-by-side on desktop) */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
        {/* Community Impact Card */}
        <div className="lg:flex-[3] rounded-[18px] lg:rounded-[24px] bg-surface p-4 lg:p-5 shadow-sm">
          <span className="text-base lg:text-xl font-medium text-text-primary">Community Impact</span>
          <div className="mt-2">
            <p className="text-[28px] lg:text-[32px] font-semibold text-text-primary">{stats.totalContributions.toLocaleString()}</p>
          </div>
          <div className="mt-0.5 flex items-center gap-1">
            <span className={`text-xs lg:text-sm font-semibold ${stats.totalContributionsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.totalContributionsChange >= 0 ? '↑' : '↓'} {Math.abs(stats.totalContributionsChange)}%
            </span>
            <span className="text-xs lg:text-sm text-text-muted">than last month</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowDonateModal(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-accent px-2.5 py-2 lg:py-2.5 text-sm lg:text-base font-semibold text-text-primary"
            >
              ♥ Donate
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border-default px-2.5 py-2 lg:py-2.5 text-sm lg:text-base font-medium text-text-secondary"
            >
              ⇄ Request
            </button>
          </div>

          <div className="mt-7 rounded-[14px] lg:rounded-2xl bg-surface-alt p-3 lg:p-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm lg:text-xl font-medium text-text-primary">Impact</span>
              <span className="text-xs lg:text-sm text-text-muted">| Community Stats</span>
            </div>
            <div className="mt-2 flex gap-2 lg:gap-3">
              {[
                { icon: Heart, label: "Donations", value: "Rs 4,520" },
                { icon: Recycle, label: "Shared", value: stats.itemsReused },
                { icon: Handshake, label: "Helped", value: stats.peopleHelped },
              ].map((item) => (
                <div key={item.label} className="flex-1 rounded-xl lg:rounded-2xl border border-border-light bg-surface p-3.5 lg:p-5">
                  <div className="flex items-center gap-1">
                    <item.icon size={14} strokeWidth={1.5} className="text-text-primary" />
                    <span className="text-[10px] lg:text-xs text-text-muted leading-tight">{item.label}</span>
                  </div>
                  <p className="mt-1 text-sm lg:text-base font-semibold text-text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Stats Grid */}
        <div className="lg:flex-[3.5] rounded-[18px] lg:rounded-[24px] bg-surface p-4 lg:p-5 shadow-sm grid grid-cols-2 gap-2.5 lg:gap-3">
          <div className="rounded-[16px] bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] p-3.5 lg:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-base font-medium text-text-primary">Items Reused</span>
              <span className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-white/40">
                <Recycle size={14} strokeWidth={1.5} className="text-text-primary" />
              </span>
            </div>
            <p className="mt-3 lg:mt-3 text-[24px] lg:text-[30px] font-semibold text-text-primary">{stats.itemsReused}</p>
            <div className="mt-0.5 flex items-center gap-1">
              <span className="text-[10px] lg:text-xs font-semibold text-text-primary">↑ {stats.itemsChange}%</span>
              <span className="text-[10px] lg:text-xs text-text-primary/60">This month</span>
            </div>
          </div>

          <div className="rounded-[16px] bg-surface-alt p-3.5 lg:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-base font-medium text-text-muted">Donations Made</span>
              <span className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-gray-200">
                <Gift size={14} strokeWidth={1.5} className="text-text-secondary" />
              </span>
            </div>
            <p className="mt-3 lg:mt-3 text-[24px] lg:text-[30px] font-semibold text-text-primary">{stats.donationsMade}</p>
            <div className="mt-0.5 flex items-center gap-1">
              <span className={`text-[10px] lg:text-xs font-semibold ${stats.donationsChange >= 0 ? "text-green-500" : "text-red-400"}`}>
                {stats.donationsChange >= 0 ? "↑" : "↓"} {Math.abs(stats.donationsChange)}%
              </span>
              <span className="text-[10px] lg:text-xs text-text-muted">This month</span>
            </div>
          </div>

          <div className="rounded-[16px] bg-surface-alt p-3.5 lg:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-base font-medium text-text-muted">People Helped</span>
              <span className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-gray-200">
                <Users size={14} strokeWidth={1.5} className="text-text-secondary" />
              </span>
            </div>
            <p className="mt-3 lg:mt-3 text-[24px] lg:text-[30px] font-semibold text-text-primary">{stats.peopleHelped}</p>
            <div className="mt-0.5 flex items-center gap-1">
              <span className={`text-[10px] lg:text-xs font-semibold ${stats.peopleChange >= 0 ? "text-green-500" : "text-red-400"}`}>
                {stats.peopleChange >= 0 ? "↑" : "↓"} {Math.abs(stats.peopleChange)}%
              </span>
              <span className="text-[10px] lg:text-xs text-text-muted">This month</span>
            </div>
          </div>

          <div className="rounded-[16px] bg-surface-alt p-3.5 lg:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-base font-medium text-text-muted">Events Joined</span>
              <span className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-gray-200">
                <Calendar size={14} strokeWidth={1.5} className="text-text-secondary" />
              </span>
            </div>
            <p className="mt-3 lg:mt-3 text-[24px] lg:text-[30px] font-semibold text-text-primary">{stats.eventsJoined}</p>
            <div className="mt-0.5 flex items-center gap-1">
              <span className={`text-[10px] lg:text-xs font-semibold ${stats.eventsChange >= 0 ? "text-green-500" : "text-red-400"}`}>
                {stats.eventsChange >= 0 ? "↑" : "↓"} {Math.abs(stats.eventsChange)}%
              </span>
              <span className="text-[10px] lg:text-xs text-text-muted">This month</span>
            </div>
          </div>
        </div>

        {/* CO2 Chart */}
        <div className="lg:flex-[3.5]">
          <IncomeChart />
        </div>
      </div>

      {/* Row 2: AQI Card + Recent Activities (side-by-side on desktop) */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
        <div className="lg:flex-[3]">
          <AqiCard />
        </div>
        <div className="lg:flex-[5]">
          <RecentActivities />
        </div>
      </div>

      {showDonateModal && (
        <DonateModal onClose={() => setShowDonateModal(false)} />
      )}

      <ThankYouPopup />

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50 lg:p-4" onClick={() => setShowRequestModal(false)}>
          <div className="relative w-full max-w-lg lg:rounded-[24px] rounded-t-[24px] bg-white p-5 lg:p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            >
              <X size={16} />
            </button>
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4">About SewaGo</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                <strong>SewaGo</strong> is a community-driven platform dedicated to fostering sustainability,
                collaboration, and social impact.
              </p>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">What We Do</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">♻</span>
                    <span><strong>Marketplace:</strong> Exchange, giveaway, or request items.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">📅</span>
                    <span><strong>Events:</strong> Organize and join local community events.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">🌱</span>
                    <span><strong>Sustainability:</strong> Track your CO₂ savings.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">🤝</span>
                    <span><strong>Donations:</strong> Support community projects directly.</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => { setShowRequestModal(false); setShowDonateModal(true); }}
                className="flex-1 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-gray-900 transition-colors"
              >
                ♥ Donate Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
