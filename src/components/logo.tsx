"use client";

import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex w-fit items-center gap-1.5 rounded-full sm:rounded-[36px] bg-surface px-2 h-9 sm:h-14 sm:px-4"
    >
      <img src="/logo.png" alt="SewaGo" className="h-7 w-7 sm:h-12 sm:w-12 object-contain" />
      <span className="text-[15px] sm:text-[18px] font-semibold text-gray-800 whitespace-nowrap">
        SewaGo
      </span>
    </Link>
  );
}
