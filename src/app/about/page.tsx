"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight, ArrowUpRight,
  Users, Globe, Shield, Heart,
  Target, Zap, Star, MapPin,
  MessageSquare, Tag, Calendar,
  ChevronRight, TrendingUp,
} from "lucide-react";

interface AboutStats {
  activeUsers: number;
  totalPosts: number;
  totalEvents: number;
  totalOffers: number;
  totalComments: number;
  totalDonations: number;
  totalEventRegs: number;
  totalActivity: number;
}

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "50+", label: "Neighborhoods" },
  { value: "100+", label: "Services" },
  { value: "4.9", label: "App Rating" },
];

const values = [
  { icon: Heart, title: "Community First", desc: "Neighbors helping neighbors. Every feature strengthens local connections." },
  { icon: Shield, title: "Trust & Safety", desc: "Verified users, secure transactions, and transparent reviews." },
  { icon: Globe, title: "Sustainability", desc: "Reducing waste through local exchanges and giveaways." },
  { icon: Users, title: "Inclusivity", desc: "Simple tools for real people, regardless of background." },
];

const features = [
  { icon: Tag, title: "Marketplace", desc: "Exchange, giveaway, or request items from your neighbors." },
  { icon: Calendar, title: "Events", desc: "Discover and organize community events, workshops, and meetups." },
  { icon: MessageSquare, title: "Messaging", desc: "Real-time chat with image sharing to coordinate transactions." },
  { icon: Star, title: "Profiles", desc: "Build trust through verified profiles and community reputation." },
];

export default function AboutPage() {
  const [data, setData] = useState<AboutStats | null>(null);

  useEffect(() => {
    fetch("/api/about")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const fmt = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K+";
    return String(n);
  };

  const liveStats = data
    ? [
        { value: fmt(data.activeUsers), label: "Active Users" },
        { value: data.activeUsers >= 50 ? "50+" : String(data.activeUsers), label: "Neighborhoods" },
        { value: fmt(data.totalPosts + data.totalOffers), label: "Services" },
        { value: "4.9", label: "App Rating" },
      ]
    : stats;

  const liveHighlights = data
    ? [
        { num: "2024", text: "Founded" },
        { num: data.activeUsers >= 50 ? "50+" : String(data.activeUsers), text: "Neighborhoods" },
        { num: fmt(data.activeUsers), text: "Lives impacted" },
        { num: fmt(data.totalPosts + data.totalOffers), text: "Services" },
      ]
    : [
        { num: "2024", text: "Founded" },
        { num: "50+", text: "Neighborhoods" },
        { num: "10K+", text: "Lives impacted" },
        { num: "100+", text: "Services" },
      ];

  return (
    <div className="flex flex-col gap-6 sm:gap-10 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* Hero */}
      <div className="rounded-[16px] sm:rounded-[24px] bg-nav-active px-6 sm:px-14 py-8 sm:py-16 text-white">
        <div className="max-w-3xl">
          <p className="text-xs sm:text-sm font-medium text-accent tracking-wide uppercase mb-3 sm:mb-5">About SewaGo</p>
          <h1 className="text-[24px] sm:text-[36px] lg:text-[44px] leading-[1.15] font-normal mb-3 sm:mb-5">
            Connecting communities,<br />one neighborhood at a time.
          </h1>
          <p className="text-sm sm:text-lg text-white/50 leading-relaxed max-w-xl mb-6 sm:mb-10">
            SewaGo is a premium platform designed to make neighborhood sharing seamless.
            From marketplace exchanges to community events, we empower people to connect
            and build stronger local communities.
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link href="/services" className="flex items-center gap-2 rounded-full bg-accent px-5 sm:px-7 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-text-primary">
              Explore Services <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard/marketplace" className="flex items-center gap-2 rounded-full border border-white/15 px-5 sm:px-7 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium text-white/80 hover:bg-white/5 transition-colors">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {liveStats.map((s) => (
          <div key={s.label} className="rounded-[16px] sm:rounded-[24px] bg-surface p-4 sm:p-7 shadow-sm text-center">
            <p className="text-[24px] sm:text-[32px] lg:text-[40px] font-semibold text-text-primary leading-none">{s.value}</p>
            <p className="text-xs sm:text-base text-text-muted mt-1.5 sm:mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="rounded-[16px] sm:rounded-[24px] bg-surface p-5 sm:p-9 shadow-sm">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
            <Target size={18} strokeWidth={1.5} className="text-text-primary" />
            <h2 className="text-lg sm:text-2xl font-normal text-text-primary">Our Mission</h2>
          </div>
          <p className="text-sm sm:text-lg text-text-secondary leading-relaxed mb-4 sm:mb-6">
            To empower every neighborhood with tools that make sharing, trading, and connecting
            effortless. We envision a world where communities are stronger because people can
            easily find what they need — right next door.
          </p>
          <div className="flex flex-col gap-2 sm:gap-3">
            {["Reduce waste through local exchanges", "Strengthen neighborhood bonds", "Make essential services accessible"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 sm:gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                <span className="text-sm sm:text-base text-text-primary">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[16px] sm:rounded-[24px] bg-surface p-5 sm:p-9 shadow-sm">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
            <Zap size={18} strokeWidth={1.5} className="text-text-primary" />
            <h2 className="text-lg sm:text-2xl font-normal text-text-primary">Our Vision</h2>
          </div>
          <p className="text-sm sm:text-lg text-text-secondary leading-relaxed mb-4 sm:mb-6">
            A world where every neighborhood thrives through connection — where no item goes
            unused, no skill goes unshared, and every community member feels valued and supported.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {liveHighlights.map((item) => (
              <div key={item.text} className="rounded-xl sm:rounded-2xl bg-surface-alt p-3 sm:p-4">
                <p className="text-base sm:text-xl font-semibold text-text-primary">{item.num}</p>
                <p className="text-[10px] sm:text-sm text-text-muted mt-0.5">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div>
        <div className="mb-6 sm:mb-8">
          <h2 className="text-[22px] sm:text-[28px] lg:text-[32px] font-normal text-text-primary mb-1.5 sm:mb-2">Our Values</h2>
          <p className="text-sm sm:text-lg text-text-muted">The principles that guide everything we build</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {values.map((val) => (
            <div key={val.title} className="rounded-[16px] sm:rounded-[24px] border border-border-light bg-surface p-5 sm:p-7 shadow-sm">
              <val.icon size={20} strokeWidth={1.5} className="text-text-primary mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg font-semibold text-text-primary mb-1.5 sm:mb-2">{val.title}</p>
              <p className="text-xs sm:text-base text-text-muted leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <div className="mb-6 sm:mb-8">
          <h2 className="text-[22px] sm:text-[28px] lg:text-[32px] font-normal text-text-primary mb-1.5 sm:mb-2">What We Offer</h2>
          <p className="text-sm sm:text-lg text-text-muted">Everything you need for a connected community</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
          {features.map((feat) => (
            <div key={feat.title} className="flex items-start gap-4 sm:gap-5 rounded-[16px] sm:rounded-[24px] bg-surface p-5 sm:p-7 shadow-sm">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-surface-alt flex-shrink-0">
                <feat.icon size={18} strokeWidth={1.5} className="text-text-primary" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold text-text-primary mb-1 sm:mb-1.5">{feat.title}</p>
                <p className="text-xs sm:text-base text-text-muted leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="rounded-[16px] sm:rounded-[24px] bg-surface p-6 sm:p-12 shadow-sm text-center">
        <h2 className="text-[22px] sm:text-[28px] lg:text-[32px] font-normal text-text-primary mb-2 sm:mb-3">Built by a Passionate Team</h2>
        <p className="text-sm sm:text-lg text-text-muted max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed">
          Our team of 50+ engineers, designers, and community advocates work tirelessly
          to build the best neighborhood platform.
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          <Link href="/dashboard/help" className="flex items-center gap-2 rounded-full bg-accent px-5 sm:px-7 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-text-primary">
            Contact Team <ArrowRight size={16} />
          </Link>
          <Link href="/services" className="flex items-center gap-2 rounded-full border border-border-default px-5 sm:px-7 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium text-text-secondary hover:bg-surface-alt transition-colors">
            Explore More
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-[16px] sm:rounded-[24px] bg-nav-active p-6 sm:p-12 text-center">
        <h2 className="text-[22px] sm:text-[28px] lg:text-[32px] font-normal text-white mb-2 sm:mb-3">Ready to join your neighborhood?</h2>
        <p className="text-sm sm:text-lg text-white/40 mb-6 sm:mb-8 max-w-lg mx-auto">
          Start exchanging, giving away, and connecting with your community today.
        </p>
        <Link href="/services" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-text-primary">
          Explore Services <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
