"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Users, LayoutDashboard, ArrowLeft, DollarSign } from "lucide-react";

const adminNav = [
  { icon: LayoutDashboard, href: "/admin", label: "Dashboard" },
  { icon: Users, href: "/admin/verify", label: "Verify Users" },
  { icon: DollarSign, href: "/admin/donations", label: "Donations" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full bg-[#f3f3f3]">
      <aside className="flex w-[70px] flex-col items-center rounded-[36px] bg-white py-4 shadow-sm m-2">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-nav-active text-white">
          <Shield size={20} />
        </div>
        <nav className="flex flex-col items-center gap-1">
          {adminNav.map(({ icon: Icon, href, label }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <div key={href} className="relative group/item">
                <Link
                  href={href}
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                    active
                      ? "bg-nav-active text-white"
                      : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  <Icon size={20} />
                </Link>
                <div className="absolute left-full top-1/2 -translate-y-1/2 z-50 opacity-0 pointer-events-none group-hover/item:opacity-100 ml-2">
                  <div className="bg-white border border-gray-200 text-gray-800 text-sm font-medium rounded-full px-4 py-2 whitespace-nowrap shadow-lg">
                    {label}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
        <div className="mt-auto pt-4">
          <Link
            href="/dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
