"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import MarketingNavbar from "@/components/marketing-navbar";
import BottomNav from "@/components/bottom-nav";
import AuthPopup from "@/components/AuthPopup";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";
import VerificationCelebration from "@/components/verification-celebration";

const MARKETING_PATHS = ["/", "/about", "/contact"];
const STANDALONE_PATHS = ["/login", "/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMarketing = MARKETING_PATHS.includes(pathname);
  const isStandalone = STANDALONE_PATHS.includes(pathname);

  const { status, data: session } = useSession();
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authRedirectTo, setAuthRedirectTo] = useState<string | undefined>(undefined);
  const [authInitialStep, setAuthInitialStep] = useState<string | undefined>(undefined);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated" && !session?.user) return;
  }, [status, hasTriggered, session]);

  useEffect(() => {
    const handleOpenAuth = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (status === "authenticated" && session?.user) return;
      setAuthRedirectTo(detail?.redirectTo);
      setAuthInitialStep(detail?.initialStep);
      setShowAuthPopup(true);
    };
    window.addEventListener("open-auth-popup", handleOpenAuth);
    return () => window.removeEventListener("open-auth-popup", handleOpenAuth);
  }, [status, session]);

  const closeAuthPopup = () => {
    sessionStorage.setItem("auth_popup_dismissed", "true");
    setShowAuthPopup(false);
  };

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const user = session.user as { isVerified?: boolean; verificationStatus?: string; needsProfileCompletion?: boolean };
    const isVerified = user?.isVerified || user?.verificationStatus === "verified";
    const celebrationShown = localStorage.getItem("verification_celebration_shown");

    if (isVerified && !celebrationShown) {
      const timer = setTimeout(() => {
        setShowCelebration(true);
        localStorage.setItem("verification_celebration_shown", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (user?.needsProfileCompletion && !sessionStorage.getItem("profile_completion_prompted")) {
      sessionStorage.setItem("profile_completion_prompted", "true");
      setTimeout(() => {
        setShowProfileCompletion(true);
      }, 1000);
    }
  }, [status, session]);

  if (isMarketing) {
    return (
      <>
        <AuthPopup isOpen={showAuthPopup} onClose={closeAuthPopup} redirectTo={authRedirectTo} initialStep={authInitialStep as "welcome" | "phone" | "otp" | "details" | "email" | undefined} />
        <ProfileCompletionModal isOpen={showProfileCompletion} onClose={() => setShowProfileCompletion(false)} />
        <VerificationCelebration isOpen={showCelebration} onClose={() => setShowCelebration(false)} />
        <div className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md py-2 px-2 sm:px-4" style={isDesktop ? { zoom: 0.85 } as React.CSSProperties : undefined}>
          <MarketingNavbar />
        </div>
        <div className="px-2 sm:px-4 pb-6 lg:pb-4" style={isDesktop ? { zoom: 0.85 } as React.CSSProperties : undefined}>
          {children}
        </div>
      </>
    );
  }

  if (isStandalone) {
    return (
      <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/50 overflow-y-auto pt-8 pb-8">
        <button
          onClick={() => router.back()}
          className="fixed top-4 right-4 z-[210] flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border-default text-text-primary shadow-lg"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {children}
      </div>
    );
  }

  const isMessages = pathname.startsWith("/dashboard/messages");

  const hideTopBar = !isDesktop && (
    pathname.startsWith("/dashboard/marketplace") ||
    pathname.startsWith("/dashboard/events") ||
    pathname.startsWith("/dashboard/messages")
  );

  return (
    <>
      <AuthPopup isOpen={showAuthPopup} onClose={closeAuthPopup} redirectTo={authRedirectTo} />
      <ProfileCompletionModal isOpen={showProfileCompletion} onClose={() => setShowProfileCompletion(false)} />
      <VerificationCelebration isOpen={showCelebration} onClose={() => setShowCelebration(false)} />

      {isDesktop && (
        <>
          <div className="flex fixed top-0 left-0 right-0 z-50 items-center gap-3 px-4 pt-3 pb-2 backdrop-blur-sm bg-surface/5 rounded-b-2xl" style={isDesktop ? { zoom: 0.90 } as React.CSSProperties : undefined}>
            <Logo />
            <Navbar />
          </div>
          <div className="flex fixed left-4 top-[72px] bottom-4 z-40 flex-col items-center gap-[34px]" style={isDesktop ? { zoom: 0.90 } as React.CSSProperties : undefined}>
            <div className="mt-[5px]">
              <ThemeToggle />
            </div>
            <div className="mt-4">
              <Sidebar />
            </div>
            <div className="mt-auto flex w-[70px] flex-col items-center justify-center gap-1 rounded-[36px] bg-surface py-2">
              <a
                href="/dashboard/help"
                className="flex h-12 w-12 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-border-light hover:text-text-primary"
                title="Help"
              >
                <HelpCircle size={22} />
              </a>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Logout"
                className="flex h-12 w-12 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-border-light hover:text-text-primary"
              >
                <LogOut size={22} />
              </button>
            </div>
          </div>
        </>
      )}

      {!isDesktop && !hideTopBar && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border-light">
          <div className="flex items-center justify-between px-3 h-11">
            <Logo />
            <Navbar />
          </div>
        </div>
      )}

      <div
        className={`w-full flex flex-col ${isMessages && !isDesktop ? "h-dvh overflow-hidden" : "h-[117.65vh] " + (isMessages ? "overflow-hidden" : "overflow-y-auto thin-scrollbar")}`}
        style={{
          ...(isDesktop ? { zoom: 0.85 } as React.CSSProperties : {}),
          paddingTop: isDesktop ? 90 : (hideTopBar ? 0 : 44),
          paddingLeft: isDesktop ? 100 : 0,
          paddingBottom: !isDesktop ? 64 : 0,
        }}
      >
        <div className={`${!isDesktop && !isMessages ? "px-3" : ""} ${isMessages ? "flex flex-col flex-1 min-h-0" : ""}`}>
          {children}
        </div>
      </div>

      {!isDesktop && <BottomNav />}
    </>
  );
}
