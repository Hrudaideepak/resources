import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "JNTUH Hub — Everything for your semester",
  description:
    "One academic search engine for JNTUH students: notes, previous papers, syllabus, videos and resources organised by regulation, branch, semester and subject.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const local = !isSupabaseConfigured();
  const session = await getSession();
  return (
    <html lang="en">
      <body className="antialiased font-sans min-h-screen flex flex-col">
        <header className="border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-10">
          <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="font-semibold tracking-tight text-lg">
              <span className="text-indigo-600">JNTUH</span> Hub
            </Link>
            <nav className="flex items-center gap-4 text-sm text-stone-600">
              <Link href="/search" className="hover:text-stone-900">Search</Link>
              <Link href="/submit" className="hover:text-stone-900">+ Add resource</Link>
              {session ? (
                <>
                  {session.role === "admin" && (
                    <Link href="/admin" className="hover:text-stone-900">Moderation</Link>
                  )}
                  <Link href="/profile" className="hover:text-stone-900" title={session.hall_ticket}>
                    👤 {session.name.split(" ")[0]}
                  </Link>
                  <Link href="/logout" className="text-stone-400 hover:text-stone-900">Log out</Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-stone-900">Log in</Link>
                  <Link href="/signup" className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700">
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-stone-200 text-xs text-stone-500">
          <div className="mx-auto max-w-5xl px-4 py-6 flex flex-wrap gap-x-6 gap-y-2 justify-between">
            <p>
              JNTUH Hub indexes and links to publicly available resources. It does not host copyrighted material.
              Syllabus data from <a className="underline" href="https://jntuh.ac.in/syllabus">jntuh.ac.in</a>.
            </p>
            <p className="font-mono">{local ? "mode: local seed data" : "mode: supabase"}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
