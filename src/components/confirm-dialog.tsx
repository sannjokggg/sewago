"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Yes",
  cancelText = "No",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-[400px] rounded-[24px] bg-surface p-8 shadow-2xl border border-border-light"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-alt border border-border-default text-text-muted transition-colors hover:bg-border-light hover:text-text-primary"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${
            variant === "danger" ? "bg-red-100" : "bg-amber-100"
          }`}>
            <AlertTriangle size={28} className={variant === "danger" ? "text-red-500" : "text-amber-500"} />
          </div>

          <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
          <p className="text-sm text-text-secondary mb-8 leading-relaxed">{description}</p>

          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-full border border-border-default bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-surface-alt hover:shadow-sm disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-accent-hover hover:shadow-sm disabled:opacity-50"
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
