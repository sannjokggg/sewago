"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart, X } from "lucide-react";

interface VerifiedDonation {
  id: number;
  amount: number;
  name: string;
}

export default function ThankYouPopup() {
  const { data: session, status } = useSession();
  const [show, setShow] = useState(false);
  const [donation, setDonation] = useState<VerifiedDonation | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return;

    // Check localStorage for already-shown thank you popups
    const shownKey = `thank_you_shown_${userId}`;
    const shownIds: number[] = JSON.parse(localStorage.getItem(shownKey) || "[]");

    // Fetch recent notifications for donation_verified type
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (!data.notifications) return;

        // Find the most recent donation_verified notification not yet shown
        const verifiedNotif = data.notifications.find(
          (n: { type: string; related_id: number; is_read: boolean }) =>
            n.type === "donation_verified" && !shownIds.includes(n.related_id)
        );

        if (verifiedNotif) {
          // Fetch the donation details to get the amount
          fetch("/api/donations")
            .then((res) => res.json())
            .then((donations) => {
              const found = donations.find(
                (d: { id: number }) => d.id === verifiedNotif.related_id
              );
              if (found && found.status === "verified") {
                setDonation({
                  id: found.id,
                  amount: found.amount,
                  name: found.name,
                });
                setShow(true);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [status, session]);

  const handleClose = () => {
    if (!donation) return;
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return;

    const shownKey = `thank_you_shown_${userId}`;
    const shownIds: number[] = JSON.parse(localStorage.getItem(shownKey) || "[]");
    shownIds.push(donation.id);
    localStorage.setItem(shownKey, JSON.stringify(shownIds));
    setShow(false);
  };

  if (!show || !donation) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div
        className="relative w-full max-w-md rounded-[24px] bg-white p-8 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
        >
          <X size={16} />
        </button>

        {/* Animated heart */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 animate-pulse">
          <Heart size={40} className="text-pink-500 fill-pink-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thank You, {donation.name}!
        </h2>
        <p className="text-gray-600 mb-4">
          Your donation of{" "}
          <span className="font-bold text-pink-600">Rs {donation.amount}</span>{" "}
          to SewaGo has been verified and confirmed.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Your generosity makes a real difference in our community. We truly
          appreciate your support!
        </p>

        {/* Decorative confetti dots */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-[24px]">
          <div className="absolute top-4 left-6 w-2 h-2 bg-yellow-400 rounded-full rotate-45" />
          <div className="absolute top-8 right-10 w-1.5 h-1.5 bg-pink-400 rounded-full" />
          <div className="absolute top-12 left-16 w-1 h-1 bg-blue-400 rounded-full rotate-12" />
          <div className="absolute bottom-8 right-6 w-2 h-2 bg-green-400 rounded-full -rotate-45" />
          <div className="absolute bottom-12 left-10 w-1.5 h-1.5 bg-purple-400 rounded-full" />
          <div className="absolute top-6 right-20 w-1 h-1 bg-orange-400 rounded-full rotate-45" />
          <div className="absolute bottom-6 left-20 w-1.5 h-1.5 bg-red-300 rounded-full -rotate-12" />
        </div>

        <button
          onClick={handleClose}
          className="rounded-full bg-accent px-10 py-3 text-base font-semibold text-gray-900 transition-colors hover:opacity-90"
        >
          You&apos;re Welcome!
        </button>
      </div>
    </div>
  );
}
