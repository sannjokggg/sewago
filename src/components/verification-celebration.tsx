"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function VerificationCelebration({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4 rounded-[24px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 z-10"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center px-8 pt-10 pb-8 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 24L21 31L34 18"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Congratulations!
          </h2>

          <p className="text-lg font-medium text-green-600 mb-3">
            Your account has been verified!
          </p>

          <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-xs">
            Your posts, events, and offers are now visible to everyone. Thank you
            for being a trusted member of the SewaGo community!
          </p>

          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-lg font-semibold text-text-primary transition-colors hover:bg-accent-hover"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
