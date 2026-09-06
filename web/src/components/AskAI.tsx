"use client";

import Link from "next/link";
import { useState } from "react";

interface Answer {
  answer: string;
  citations: { title: string; url: string }[];
  offline: boolean;
}

/** "Ask AI about this subject" — grounded in the official syllabus units + indexed resources. */
export default function AskAI({ slug, subjectName, loggedIn }: { slug: string; subjectName: string; loggedIn: boolean }) {
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Answer | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    const q = question.trim();
    if (q.length < 3 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, question: q }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Something went wrong.");
      setResult(json as Answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-violet-200 bg-violet-50/40 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-violet-700">🤖 Ask AI about {subjectName}</h2>
      <p className="mt-1 text-xs text-stone-500">
        Answers are grounded only in the official syllabus units and indexed resources above. Every question you ask
        improves subject coverage (logged as interaction data).
      </p>
      {loggedIn ? (
        <>
          <div className="mt-3 flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              maxLength={500}
              placeholder="e.g. What are the most important topics for the exam?"
              className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
            />
            <button
              onClick={ask}
              disabled={busy}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {busy ? "Thinking…" : "Ask"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
          {result && (
            <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-relaxed shadow-sm">
              <div className="whitespace-pre-wrap">{result.answer}</div>
              {result.citations.length > 0 && (
                <div className="mt-3 border-t border-stone-100 pt-2 text-xs text-stone-500">
                  Sources:{" "}
                  {result.citations.map((c, i) => (
                    <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="mr-3 text-indigo-600 hover:underline">
                      {c.title}
                    </a>
                  ))}
                </div>
              )}
              {result.offline && <p className="mt-2 text-xs text-amber-600">⚠ Offline mode — set OPENAI_API_KEY for full AI answers.</p>}
            </div>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm text-stone-600">
          <Link href={`/login?next=/subject/${slug}`} className="font-medium text-violet-700 hover:underline">Log in with your hall ticket</Link>{" "}
          to use the AI assistant.
        </p>
      )}
    </section>
  );
}
