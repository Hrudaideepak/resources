"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox({
  initial = "",
  size = "lg",
  autoFocus = false,
}: {
  initial?: string;
  size?: "lg" | "sm";
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState(initial);
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
      className="w-full"
      role="search"
    >
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus={autoFocus}
          placeholder="Search anything… e.g. “dbms unit 3 important questions”"
          className={`w-full rounded-2xl border border-stone-300 bg-white pl-11 pr-4 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
            size === "lg" ? "h-14 text-lg" : "h-11 text-base"
          }`}
        />
      </div>
    </form>
  );
}
