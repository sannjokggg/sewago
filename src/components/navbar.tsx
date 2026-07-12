"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Search, Bell, Info, Loader2, CheckCheck, Check, CheckCircle, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

interface Notification {
  id: number;
  type: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
  { label: "Profile", href: "/dashboard/profile" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 2) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!bellOpen || !session) return;
    setLoadingNotifs(true);
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications.slice(0, 10));
        if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
      })
      .catch(console.error)
      .finally(() => setLoadingNotifs(false));
  }, [bellOpen, session]);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const markAsRead = async (id: number) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative flex flex-1 items-center" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* Desktop nav links pill */}
      {isDesktop && (
        <div
          className="flex absolute left-[calc(42%-8px)] -translate-x-1/2 items-center gap-[2px] bg-surface px-4 h-14 rounded-[36px]"
        >
          {navLinks.map(({ label, href }) => {
            const active = href.startsWith("/dashboard")
              ? pathname === href || pathname.startsWith(href + "/")
              : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-[22px] py-2 rounded-[36px] text-[18px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-nav-active text-white shadow-md"
                    : "text-text-muted hover:bg-border-light hover:text-text-primary active:bg-nav-active active:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}

      {/* ===== MOBILE: tiny bell + profile only ===== */}
      {!isDesktop && (
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-text-secondary active:scale-90 transition-transform"
            >
              <Bell size={18} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[7px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {bellOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-[280px] rounded-xl bg-surface border border-border-default shadow-lg">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border-light">
                  <h3 className="text-[11px] font-semibold text-text-primary">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="flex items-center gap-1 text-[9px] font-medium text-accent">
                      <CheckCheck size={10} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[260px] overflow-y-auto">
                  {loadingNotifs ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 size={16} className="animate-spin text-text-muted" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-[11px] text-text-muted">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id);
                          if (notif.link) router.push(notif.link);
                          setBellOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 transition-colors hover:bg-border-light ${
                          !notif.is_read ? "bg-accent/5" : ""
                        }`}
                      >
                        <p className={`text-[11px] ${!notif.is_read ? "font-semibold text-text-primary" : "text-text-secondary"}`}>
                          {notif.message}
                        </p>
                        <p className="mt-0.5 text-[8px] text-text-muted">{timeAgo(notif.created_at)}</p>
                      </button>
                    ))
                  )}
                </div>
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setBellOpen(false)}
                  className="block rounded-b-xl border-t border-border-light px-3 py-2 text-center text-[11px] font-medium text-accent"
                >
                  See all
                </Link>
              </div>
            )}
          </div>
          {session?.user ? (
            <button
              onClick={() => router.push("/dashboard/profile")}
              className="flex h-8 items-center gap-1 bg-surface pl-1 pr-2 rounded-full active:scale-90 transition-transform"
            >
              <div className="relative shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-text-primary">
                  {(session.user as { image?: string }).image ? (
                    <img src={(session.user as { image: string }).image} alt="" className="h-full w-full object-cover rounded-full" />
                  ) : (
                    (session.user as { name?: string }).name?.[0]?.toUpperCase() || "?"
                  )}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-text-primary leading-tight">{(session.user as { name?: string }).name?.split(" ")[0] || "User"}</span>
            </button>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { redirectTo: "/dashboard" } }))}
              className="flex h-8 items-center gap-1 bg-accent px-2.5 rounded-full active:scale-90 transition-transform"
            >
              <User size={15} strokeWidth={2} className="text-text-primary" />
              <span className="text-[11px] font-semibold text-text-primary">Sign Up</span>
            </button>
          )}
        </div>
      )}

      {/* ===== DESKTOP: full original navbar ===== */}
      {isDesktop && (
        <div className="flex absolute right-[3px] items-center gap-4">
          <div className="flex items-center gap-3 bg-surface px-4 h-14 rounded-[36px]">
            <button
              onClick={() => router.push("/dashboard/messages")}
              className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-all duration-200 hover:bg-border-light hover:text-text-primary active:bg-nav-active active:text-white active:scale-95"
            >
              <Search size={18} strokeWidth={2} />
            </button>
            <div className="relative" ref={!bellOpen ? undefined : bellRef}>
              <button
                onClick={() => setBellOpen(!bellOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-all duration-200 hover:bg-border-light hover:text-text-primary active:bg-nav-active active:text-white active:scale-95"
              >
                <Bell size={18} strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-[360px] rounded-2xl bg-surface border border-border-default shadow-lg">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                    <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                      >
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {loadingNotifs ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 size={20} className="animate-spin text-text-muted" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-sm text-text-muted">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => {
                            markAsRead(notif.id);
                            if (notif.link) router.push(notif.link);
                            setBellOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 transition-colors hover:bg-border-light ${
                            !notif.is_read ? "bg-accent/5" : ""
                          }`}
                        >
                          <p className={`text-sm ${!notif.is_read ? "font-semibold text-text-primary" : "text-text-secondary"}`}>
                            {notif.message}
                          </p>
                          <p className="mt-0.5 text-[11px] text-text-muted">{timeAgo(notif.created_at)}</p>
                        </button>
                      ))
                    )}
                  </div>
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setBellOpen(false)}
                    className="block rounded-b-2xl border-t border-border-light px-4 py-3 text-center text-sm font-medium text-accent hover:bg-border-light transition-colors"
                  >
                    See all notifications
                  </Link>
                </div>
              )}
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-all duration-200 hover:bg-border-light hover:text-text-primary active:bg-nav-active active:text-white active:scale-95">
              <Info size={18} strokeWidth={2} />
            </button>
          </div>

          {session?.user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 bg-surface border border-border-default pl-1.5 pr-3 h-14 rounded-[36px] cursor-pointer hover:shadow-sm transition-all"
              >
                <div className="relative shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-text-primary">
                    {(session.user as { image?: string }).image ? (
                      <img src={(session.user as { image: string }).image} alt="" className="h-full w-full object-cover rounded-full" />
                    ) : (
                      (session.user as { name?: string }).name?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="absolute -bottom-[2px] -right-[2px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent ring-[2px] ring-surface z-10">
                    <Check size={10} strokeWidth={3} className="text-text-primary" />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-text-primary leading-tight">
                    {(session.user as { name?: string }).name || "User"}
                  </span>
                  <span className="text-[11px] text-text-muted leading-tight truncate max-w-[120px]">
                    {(session.user as { email?: string }).email || ""}
                  </span>
                </div>
                <ChevronDown size={16} className={`text-text-muted transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-[240px] rounded-2xl bg-surface border border-border-default shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-border-light">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {(session.user as { name?: string }).name || "User"}
                    </p>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {(session.user as { email?: string }).email || ""}
                    </p>
                    {(session.user as { isVerified?: boolean }).isVerified && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <CheckCircle size={12} className="text-green-500" />
                        <span className="text-[10px] font-medium text-green-500">Verified Account</span>
                      </div>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { router.push("/dashboard/profile"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-border-light transition-colors"
                    >
                      <User size={16} /> View Profile
                    </button>
                    <button
                      onClick={() => { router.push("/dashboard/settings"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-border-light transition-colors"
                    >
                      <Settings size={16} /> Settings
                    </button>
                  </div>
                  <div className="border-t border-border-light py-1">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-border-light transition-colors"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { redirectTo: "/dashboard" } }))}
              className="flex items-center gap-2 bg-accent px-8 h-11 rounded-full cursor-pointer hover:shadow-sm transition-all"
            >
              <span className="text-sm font-semibold text-text-primary">Sign Up</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
