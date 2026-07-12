"use client";

import { X } from "lucide-react";

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string;
}

export default function LoginPrompt({ isOpen, onClose, action = "continue" }: LoginPromptProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-[24px] p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-[#B8F25E] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a2e1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-[#1a2e1a] mb-2">Sign in to {action}</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to {action}. Join our community and start making a difference!
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onClose();
                setTimeout(() => window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { redirectTo: "/dashboard", initialStep: "email" } })), 100);
              }}
              className="w-full bg-[#1a2e1a] text-white py-3 rounded-[12px] font-semibold hover:bg-[#2a3e2a] transition-colors text-center"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                onClose();
                setTimeout(() => window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { redirectTo: "/dashboard", initialStep: "details" } })), 100);
              }}
              className="w-full bg-[#B8F25E] text-[#1a2e1a] py-3 rounded-[12px] font-semibold hover:bg-[#a8e04e] transition-colors text-center"
            >
              Create Account
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            You can still browse marketplace and events without signing in.
          </p>
        </div>
      </div>
    </div>
  );
}
