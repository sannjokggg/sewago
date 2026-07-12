"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { ArrowUpRight, Check, CheckCircle, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Marketplace", href: "/dashboard/marketplace" },
  { label: "Events", href: "/dashboard/events" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

export default function MarketingNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/#contact") return pathname === "/contact";
    if (href.startsWith("/dashboard")) return pathname === href || pathname.startsWith(href + "/");
    return pathname === href;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "/#contact") {
      if (pathname === "/") {
        e.preventDefault();
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="relative w-full" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div className="flex items-center justify-between w-full rounded-[28px] px-4 sm:px-6 py-2">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full">
            <img src="/logo.png" alt="SewaGo" className="h-10 w-10 sm:h-14 sm:w-14 object-contain" />
          </div>
          <span className="text-lg sm:text-[22px] font-semibold text-text-primary">SewaGo</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ label, href }) => {
            const active = isActive(href);
            const isProtected = href.startsWith("/dashboard");
            return (
              <a
                key={href}
                href={href}
                onClick={(e) => {
                  handleNavClick(e, href);
                  if (isProtected) {
                    e.preventDefault();
                    if (session?.user) {
                      router.push(href);
                    } else {
                      window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { redirectTo: href } }));
                    }
                  }
                }}
                className={`px-[28px] py-2 rounded-[36px] text-[18px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-nav-active text-white shadow-md"
                    : "text-text-muted hover:bg-border-light hover:text-text-primary"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {session?.user ? (
            <>
              <div className="relative shrink-0">
                <button
                  onClick={() => router.push("/dashboard/profile")}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-text-primary overflow-hidden transition-colors hover:bg-accent-hover"
                >
                  {(session.user as { image?: string; name?: string }).image ? (
                    <img src={(session.user as { image: string }).image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (session.user as { name?: string }).name?.[0]?.toUpperCase() || "?"
                  )}
                </button>
                <div className="absolute -bottom-[2px] -right-[2px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-accent ring-[2px] ring-surface z-10">
                  <Check size={9} strokeWidth={3} className="text-text-primary" />
                </div>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="hidden sm:flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-accent-hover"
              >
                Dashboard
                <ArrowUpRight size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { redirectTo: "/dashboard" } }))}
                className="hidden sm:block rounded-full border border-border-default px-5 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-border-light"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="hidden sm:flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-base font-semibold text-text-primary transition-colors hover:bg-accent-hover"
              >
                Try Now
                <ArrowUpRight size={18} />
              </button>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text-primary transition-colors hover:bg-border-light"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 mt-2 z-50">
          <div className="mx-2 rounded-[20px] bg-surface border border-border-default shadow-xl overflow-hidden">
            <div className="p-4 space-y-1">
              {navLinks.map(({ label, href }) => {
                const active = isActive(href);
                const isProtected = href.startsWith("/dashboard");
                return (
                  <a
                    key={href}
                    href={href}
                    onClick={(e) => {
                      handleNavClick(e, href);
                      setMobileOpen(false);
                      if (isProtected) {
                        e.preventDefault();
                        if (session?.user) {
                          router.push(href);
                        } else {
                          window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { redirectTo: href } }));
                        }
                      }
                    }}
                    className={`block px-4 py-3 rounded-[14px] text-base font-medium transition-all ${
                      active
                        ? "bg-nav-active text-white"
                        : "text-text-secondary hover:bg-border-light hover:text-text-primary"
                    }`}
                  >
                    {label}
                  </a>
                );
              })}
            </div>
            {!session?.user && (
              <div className="p-4 pt-0 space-y-2">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { redirectTo: "/dashboard" } }));
                  }}
                  className="w-full rounded-full border border-border-default px-5 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-border-light"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    router.push("/dashboard");
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-base font-semibold text-text-primary transition-colors hover:bg-accent-hover"
                >
                  Try Now
                  <ArrowUpRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
