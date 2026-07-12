"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  LayoutGrid,
  CalendarDays,
  MessageSquare,
  Globe,
  Settings,
  Shield,
} from "lucide-react";

const navItems = [
  { icon: LayoutGrid, href: "/dashboard", label: "Dashboard" },
  { icon: CalendarDays, href: "/dashboard/events", label: "Events" },
  { icon: MessageSquare, href: "/dashboard/messages", label: "Messages" },
  { icon: Globe, href: "/dashboard/marketplace", label: "Marketplace" },
  { icon: Settings, href: "/dashboard/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    const fetchUnread = () => {
      fetch("/api/messages/unread")
        .then((res) => res.json())
        .then((data) => {
          if (data.count !== undefined) setUnreadCount(data.count);
        })
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [session]);

  return (
    <aside className="flex w-[70px] flex-col items-center justify-center rounded-[36px] bg-surface py-2 shadow-sm overflow-visible">
      <nav className="flex flex-col items-center gap-0.5">
        {navItems.map(({ icon: Icon, href, label }) => {
          const active = href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === href || pathname.startsWith(href + "/");
          const showBadge = label === "Messages" && unreadCount > 0;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                active
                  ? "bg-nav-active text-white"
                  : "text-text-muted hover:bg-border-light hover:text-text-secondary"
              }`}
            >
              <Icon size={20} />
              {showBadge && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors mt-1 ${
              pathname.startsWith("/admin")
                ? "bg-nav-active text-white"
                : "text-text-muted hover:bg-border-light hover:text-text-secondary"
            }`}
          >
            <Shield size={20} />
          </Link>
        )}
      </nav>
    </aside>
  );
}
