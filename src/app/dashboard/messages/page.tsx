"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import MessagesContent from "./content";

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 min-h-0 items-center justify-center rounded-[18px] lg:rounded-[24px] bg-surface shadow-sm">
        <Loader2 size={24} className="animate-spin text-text-muted" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
