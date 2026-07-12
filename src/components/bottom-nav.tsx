"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  LayoutGrid,
  CalendarDays,
  MessageSquare,
  Globe,
  User,
} from "lucide-react";

const navItems = [
  { icon: LayoutGrid, href: "/dashboard", label: "Home" },
  { icon: Globe, href: "/dashboard/marketplace", label: "Market" },
  { icon: CalendarDays, href: "/dashboard/events", label: "Events" },
  { icon: MessageSquare, href: "/dashboard/messages", label: "Chat" },
  { icon: User, href: "/dashboard/profile", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/98 backdrop-blur-lg border-t border-border-light safe-area-bottom">
      <div className="flex items-center justify-around py-1 px-0.5 max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, href, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const showBadge = label === "Chat" && unreadCount > 0;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-px rounded-lg px-2.5 py-1 min-w-[48px] transition-all duration-150 ${
                active ? "text-nav-active" : "text-text-muted active:scale-90"
              }`}
            >
              <div className={`relative flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                active ? "bg-nav-active text-white" : ""
              }`}>
                <Icon size={15} strokeWidth={active ? 2.5 : 1.5} />
                {showBadge && (
                  <span className="absolute -right-1 -top-1 flex h-3 min-w-[12px] items-center justify-center rounded-full bg-red-500 px-px text-[7px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[9px] leading-tight ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
