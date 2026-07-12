"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, CheckCheck, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: number;
  type: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  const markAsRead = async (id: number) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface hover:bg-border-light transition-colors"
          >
            <ArrowLeft size={18} className="text-text-primary" />
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent/10 text-accent hover:bg-accent/20 text-sm font-medium transition-colors"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface mb-4">
            <Bell size={28} className="text-text-muted" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">No notifications yet</h2>
          <p className="text-sm text-text-muted">When you get notifications, they'll show up here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => {
                markAsRead(notif.id);
                if (notif.link) router.push(notif.link);
              }}
              className={`w-full text-left rounded-2xl p-4 transition-colors hover:bg-border-light ${
                !notif.is_read ? "bg-accent/5 border border-accent/20" : "bg-surface border border-border-default"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                    !notif.is_read ? "bg-accent" : "bg-transparent"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      !notif.is_read ? "font-semibold text-text-primary" : "text-text-secondary"
                    }`}
                  >
                    {notif.message}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{timeAgo(notif.created_at)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
