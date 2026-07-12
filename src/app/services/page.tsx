"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Calendar,
  Heart,
  BookOpen,
  Trash2,
  Utensils,
  Recycle,
  Handshake,
} from "lucide-react";
import DonateModal from "@/components/donate-modal";

const services = [
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Exchange, giveaway, or request items from your community.",
    href: "/dashboard/marketplace",
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Join cleaning campaigns, plantation drives, workshops, and community meetups.",
    href: "/dashboard/events",
  },
  {
    icon: Heart,
    title: "Donations",
    description: "Support verified NGOs working on climate and social causes with secure donations.",
    href: "/donate",
  },
  {
    icon: BookOpen,
    title: "Education",
    description: "Learn about climate change, sustainability, waste management, and social impact.",
    href: "/about",
  },
  {
    icon: Trash2,
    title: "Waste Management",
    description: "Learn proper waste disposal and support recycling initiatives in your area.",
    href: "/about",
  },
  {
    icon: Utensils,
    title: "Food Sharing",
    description: "Help fight hunger by sharing food with those in need.",
    href: "/about",
  },
  {
    icon: Recycle,
    title: "Sustainability",
    description: "Track your environmental impact — items reused, CO2 saved, waste diverted.",
    href: "/dashboard",
  },
  {
    icon: Handshake,
    title: "Community",
    description: "Connect with neighbors, build reputation, and strengthen local bonds.",
    href: "/dashboard/messages",
  },
];

export default function ServicesPage() {
  const [showDonateModal, setShowDonateModal] = useState(false);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Services</h1>
        <p className="text-sm sm:text-base text-text-secondary mt-1">Everything you need to make a difference in your community.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {services.map((s) => (
          s.href === "/donate" ? (
            <button
              key={s.title}
              onClick={() => setShowDonateModal(true)}
              className="group flex flex-col rounded-2xl bg-surface p-4 sm:p-5 shadow-sm border border-border-light hover:shadow-lg transition-all hover:-translate-y-0.5 text-left w-full"
            >
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-border-default mb-3 sm:mb-4">
                <s.icon size={18} className="text-text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-text-primary">{s.title}</h3>
              <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-text-secondary leading-relaxed flex-1">{s.description}</p>
              <span className="mt-3 sm:mt-4 text-[10px] sm:text-xs font-medium text-accent group-hover:underline">Learn More →</span>
            </button>
          ) : (
            <Link
              key={s.title}
              href={s.href}
              className="group flex flex-col rounded-2xl bg-surface p-4 sm:p-5 shadow-sm border border-border-light hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-border-default mb-3 sm:mb-4">
                <s.icon size={18} className="text-text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-text-primary">{s.title}</h3>
              <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-text-secondary leading-relaxed flex-1">{s.description}</p>
              <span className="mt-3 sm:mt-4 text-[10px] sm:text-xs font-medium text-accent group-hover:underline">Learn More →</span>
            </Link>
          )
        ))}
      </div>

      {showDonateModal && (
        <DonateModal onClose={() => setShowDonateModal(false)} />
      )}
    </div>
  );
}
