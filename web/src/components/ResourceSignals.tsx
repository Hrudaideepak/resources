"use client";

import { useState } from "react";

/**
 * 👍/👎 feedback on a resource + click beacon. These votes are the training
 * signal that re-ranks resources over time (see lib/events.ts popularity).
 */
export default function ResourceSignals({ resourceId, subjectId }: { resourceId: string; subjectId: string }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  async function send(kind: "up" | "down") {
    if (vote) return;
    setVote(kind);
    await fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, resource_id: resourceId, subject_id: subjectId }),
    }).catch(() => {});
  }

  return (
    <span className="inline-flex items-center gap-1" onClick={(e) => e.preventDefault()}>
      <button
        title="Useful"
        onClick={() => send("up")}
        className={`rounded px-1 py-0.5 text-xs ${vote === "up" ? "bg-emerald-100" : "hover:bg-stone-100"}`}
      >
        👍
      </button>
      <button
        title="Not useful / broken"
        onClick={() => send("down")}
        className={`rounded px-1 py-0.5 text-xs ${vote === "down" ? "bg-rose-100" : "hover:bg-stone-100"}`}
      >
        👎
      </button>
      {vote && <span className="ml-1 text-xs text-emerald-600">thanks!</span>}
    </span>
  );
}
