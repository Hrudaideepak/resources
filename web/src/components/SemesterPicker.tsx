"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Branch, College, Regulation } from "@/lib/types";

const KEY = "jntuhhub:semester";

export interface SemesterSelection {
  college: string;
  regulation: string;
  branch: string;
  year: number;
  semester: number;
}

export function readSavedSelection(): SemesterSelection | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
}

export default function SemesterPicker({
  colleges,
  regulations,
  branches,
}: {
  colleges: College[];
  regulations: Regulation[];
  branches: Branch[];
}) {
  const router = useRouter();
  const [sel, setSel] = useState<SemesterSelection>({
    college: colleges[0]?.slug ?? "jntuh",
    regulation: regulations[0]?.slug ?? "r22",
    branch: branches[0]?.slug ?? "cse",
    year: 2,
    semester: 2,
  });
  const [saved, setSaved] = useState<SemesterSelection | null>(null);

  useEffect(() => {
    const s = readSavedSelection();
    if (s) {
      setSel(s);
      setSaved(s);
    }
  }, []);

  const go = () => {
    localStorage.setItem(KEY, JSON.stringify(sel));
    router.push(`/${sel.college}/${sel.regulation}/${sel.branch}/${sel.year}-${sel.semester}`);
  };

  const field = "h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none";

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Select your semester</h2>
        {saved && (
          <button
            onClick={() => router.push(`/${saved.college}/${saved.regulation}/${saved.branch}/${saved.year}-${saved.semester}`)}
            className="text-sm text-indigo-600 hover:underline"
          >
            Open my semester ({saved.regulation.toUpperCase()} {saved.branch.toUpperCase()} {saved.year}-{saved.semester}) →
          </button>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">
        <select className={field} value={sel.college} onChange={(e) => setSel({ ...sel, college: e.target.value })}>
          {colleges.map((c) => (
            <option key={c.slug} value={c.slug}>{c.short_name}</option>
          ))}
        </select>
        <select className={field} value={sel.regulation} onChange={(e) => setSel({ ...sel, regulation: e.target.value })}>
          {regulations.map((r) => (
            <option key={r.slug} value={r.slug}>{r.name}</option>
          ))}
        </select>
        <select className={field} value={sel.branch} onChange={(e) => setSel({ ...sel, branch: e.target.value })}>
          {branches.map((b) => (
            <option key={b.slug} value={b.slug}>{b.code}</option>
          ))}
        </select>
        <select className={field} value={sel.year} onChange={(e) => setSel({ ...sel, year: +e.target.value })}>
          {[1, 2, 3, 4].map((y) => (
            <option key={y} value={y}>Year {y}</option>
          ))}
        </select>
        <select className={field} value={sel.semester} onChange={(e) => setSel({ ...sel, semester: +e.target.value })}>
          {[1, 2].map((s) => (
            <option key={s} value={s}>Sem {s}</option>
          ))}
        </select>
        <button onClick={go} className="h-11 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
          Go →
        </button>
      </div>
    </div>
  );
}
