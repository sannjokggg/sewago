"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex w-[70px] flex-col items-center justify-center gap-1 rounded-[36px] bg-surface py-2">
      <button
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
          mounted && theme === "light"
            ? "bg-border-light text-text-primary"
            : "text-text-muted hover:bg-border-light hover:text-text-secondary"
        }`}
        onClick={() => setTheme("light")}
        title="Light mode"
      >
        <Sun size={22} />
      </button>
      <button
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
          mounted && theme === "dark"
            ? "bg-border-light text-text-primary"
            : "text-text-muted hover:bg-border-light hover:text-text-secondary"
        }`}
        onClick={() => setTheme("dark")}
        title="Dark mode"
      >
        <Moon size={22} />
      </button>
    </div>
  );
}
