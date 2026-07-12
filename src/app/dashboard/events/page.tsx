"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CalendarDays, Loader2, GraduationCap, Cpu, Heart,
  Users, Trophy, Palette, Briefcase, PartyPopper, Search, X,
} from "lucide-react";
import ImageLightbox from "@/components/image-lightbox";
import ThreeDotMenu from "@/components/three-dot-menu";

interface Event {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  image_url: string | null;
  images: string[];
  contact_email: string | null;
  contact_phone: string | null;
  max_attendees: number | null;
  registration_link: string | null;
  organizer_name: string;
  created_at: string;
}

const categoryConfig: Record<string, { icon: typeof GraduationCap; color: string; bg: string; badge: string }> = {
  Education: { icon: GraduationCap, color: "text-[#3B82F6]", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700" },
  Technology: { icon: Cpu, color: "text-[#8B5CF6]", bg: "bg-purple-50", badge: "bg-purple-100 text-purple-700" },
  "Health & Wellness": { icon: Heart, color: "text-[#EF4444]", bg: "bg-red-50", badge: "bg-red-100 text-red-700" },
  Community: { icon: Users, color: "text-[#10B981]", bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700" },
  Sports: { icon: Trophy, color: "text-[#F59E0B]", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700" },
  "Arts & Culture": { icon: Palette, color: "text-[#EC4899]", bg: "bg-pink-50", badge: "bg-pink-100 text-pink-700" },
  Business: { icon: Briefcase, color: "text-[#6366F1]", bg: "bg-indigo-50", badge: "bg-indigo-100 text-indigo-700" },
  Social: { icon: PartyPopper, color: "text-[#F97316]", bg: "bg-orange-50", badge: "bg-orange-100 text-orange-700" },
};

const filterCategories = ["All", "Education", "Technology", "Health & Wellness", "Community", "Sports", "Arts & Culture", "Business", "Social"];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function EventsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setEvents([]);
        setLoading(false);
      });
  }, []);

  const filtered = events.filter((e) => {
    const matchFilter = filter === "All" || e.category === filter;
    const matchSearch = search === "" || e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch("/api/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-6 py-1 sm:py-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div>
        <h1 className="text-lg sm:text-3xl lg:text-5xl font-normal text-text-primary">Events</h1>
      </div>

      {warning && (
        <div className="rounded-[12px] sm:rounded-[24px] border border-yellow-300 bg-yellow-50 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-yellow-900">
          {warning}
        </div>
      )}

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar pb-1">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`shrink-0 rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-base font-medium transition-all duration-200 cursor-pointer ${
                filter === cat
                  ? "bg-[#1D1B17] text-white shadow-sm"
                  : "bg-surface text-[#666666] hover:bg-gray-100 hover:text-[#222222]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border-default bg-surface px-2.5 sm:px-4 py-2 sm:py-3 flex-1 sm:flex-initial">
            <Search size={14} className="text-text-muted sm:w-[18px] sm:h-[18px]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-40 bg-transparent text-xs sm:text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-text-muted">
                <X size={12} className="sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              if (status === "loading") return;
              if (session?.user) {
                setWarning("");
                router.push("/dashboard/events/create");
              } else {
                setWarning("Please sign in to post.");
                window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { redirectTo: "/dashboard/events/create" } }));
              }
            }}
            className="shrink-0 inline-flex items-center justify-center rounded-full bg-accent px-3.5 sm:px-5 py-2 sm:py-3 text-xs sm:text-base font-semibold text-text-primary transition-colors hover:bg-accent-hover"
          >
            + Add
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-[16px] sm:rounded-[24px] bg-surface py-10 sm:py-16 shadow-sm">
          <Loader2 size={24} className="animate-spin text-text-muted sm:w-8 sm:h-8" />
          <p className="mt-2 text-xs sm:text-sm text-text-muted">Loading events...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[16px] sm:rounded-[24px] bg-surface py-10 sm:py-16 shadow-sm">
          <CalendarDays size={36} strokeWidth={1} className="text-text-muted sm:w-12 sm:h-12" />
          <p className="mt-3 text-sm sm:text-lg font-medium text-text-muted">No events yet</p>
          <p className="mt-0.5 text-xs sm:text-base text-text-muted">Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {filtered.map((event) => {
            const cfg = categoryConfig[event.category] || categoryConfig.Community;
            const Icon = cfg.icon;
            const isOwner = session?.user && String(event.user_id) === String((session.user as { id: string }).id);
            const allImages = event.images?.length > 0 ? event.images : event.image_url ? [event.image_url] : [];
            return (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="relative rounded-[14px] sm:rounded-[24px] bg-surface p-2 sm:p-3 shadow-sm transition-all hover:shadow-md"
              >
                <div className="absolute right-2.5 top-2.5 sm:right-5 sm:top-5 z-20">
                  <ThreeDotMenu
                    id={event.id}
                    isOwner={!!isOwner}
                    shareUrl={`${window.location.origin}/dashboard/events/${event.id}`}
                    onDelete={handleDelete}
                    onEdit={() => {}}
                    type={event.category}
                  />
                </div>
                <div className={`flex h-[120px] sm:h-[240px] items-center justify-center overflow-hidden rounded-[10px] sm:rounded-[16px] ${allImages.length > 0 ? "bg-surface-alt" : cfg.bg}`}>
                  {allImages.length > 0 ? (
                    <img
                      src={allImages[0]}
                      alt={event.title}
                      className="cursor-pointer transition-transform hover:scale-105 h-full w-full object-cover"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLightbox({ src: allImages[0], alt: event.title });
                      }}
                    />
                  ) : (
                    <Icon size={40} strokeWidth={1.2} className={`${cfg.color} sm:w-20 sm:h-20`} />
                  )}
                </div>
                <div className="mt-2 sm:mt-4">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-base font-semibold ${cfg.badge}`}>
                      {event.category}
                    </span>
                    <span className="text-[9px] sm:text-base text-text-muted">{timeAgo(event.created_at)}</span>
                  </div>
                  <h3 className="mt-1.5 sm:mt-3 text-xs sm:text-lg font-semibold text-text-primary line-clamp-1">{event.title}</h3>
                  <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-base text-text-secondary line-clamp-1">{event.description}</p>
                  <div className="mt-2 sm:mt-3 flex items-center gap-2">
                    <CalendarDays size={12} className="text-text-muted sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-sm text-text-muted">{formatDate(event.event_date)}</span>
                    {event.location && (
                      <>
                        <span className="text-text-muted">·</span>
                        <span className="text-[10px] sm:text-sm text-text-muted truncate">{event.location}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <button className="w-full rounded-full bg-accent px-3 sm:px-4 py-1.5 sm:py-2.5 text-[10px] sm:text-base font-semibold text-text-primary transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
