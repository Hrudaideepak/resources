/**
 * Usage events — the learning loop. Searches, resource clicks and 👍/👎 feedback
 * are logged and folded back into ranking (popularity boost) and the trending
 * widgets. This is how the engine "self-upgrades for best results" from real
 * student interaction; combined with the discovery agent's pending queue, the
 * corpus grows and re-ranks on its own, with humans approving new sources.
 *
 * Local mode: .data/events.json (append-only). Supabase mode: `events` table.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { getSupabase } from "./supabase";
import type { EventKind, UsageEvent } from "./types";

const DATA_DIR = () => process.env.DATA_DIR ?? path.join(process.cwd(), ".data");
const EVENTS_FILE = () => path.join(DATA_DIR(), "events.json");
const VALID_KINDS: EventKind[] = ["search", "click", "up", "down"];

async function readEvents(): Promise<UsageEvent[]> {
  try {
    return JSON.parse(await fs.readFile(EVENTS_FILE(), "utf8"));
  } catch {
    return [];
  }
}

export async function logEvent(e: {
  user?: string | null;
  kind: EventKind;
  subject_id?: string | null;
  resource_id?: string | null;
  query?: string | null;
}): Promise<void> {
  if (!VALID_KINDS.includes(e.kind)) return;
  const ev: UsageEvent = {
    id: crypto.randomUUID(),
    user: e.user ?? null,
    kind: e.kind,
    subject_id: e.subject_id ?? null,
    resource_id: e.resource_id ?? null,
    query: e.query?.slice(0, 200) ?? null,
    created_at: new Date().toISOString(),
  };
  const sb = getSupabase();
  if (sb) {
    await sb
      .from("events")
      .insert({ user: ev.user, kind: ev.kind, subject_id: ev.subject_id, resource_id: ev.resource_id, query: ev.query });
    return;
  }
  const events = await readEvents();
  events.push(ev);
  await fs.mkdir(DATA_DIR(), { recursive: true });
  await fs.writeFile(EVENTS_FILE(), JSON.stringify(events));
}

// ------------------------------------------------------- popularity feedback
/**
 * Score boost from interaction:
 *   boost = clamp(0..25, clicks*1 + ups*4 - downs*6)
 * A genuinely useful resource floats up; junk sinks. Applied at read time so
 * the raw seeded score stays intact.
 */
export async function popularityFor(resourceIds: string[]): Promise<Map<string, number>> {
  const boost = new Map<string, number>();
  if (!resourceIds.length) return boost;
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from("events")
      .select("resource_id,kind")
      .in("resource_id", resourceIds)
      .in("kind", ["click", "up", "down"]);
    for (const row of data ?? []) {
      const w = row.kind === "up" ? 4 : row.kind === "down" ? -6 : 1;
      boost.set(row.resource_id, (boost.get(row.resource_id) ?? 0) + w);
    }
  } else {
    const idSet = new Set(resourceIds);
    for (const ev of await readEvents()) {
      if (!ev.resource_id || !idSet.has(ev.resource_id)) continue;
      const w = ev.kind === "up" ? 4 : ev.kind === "down" ? -6 : ev.kind === "click" ? 1 : 0;
      boost.set(ev.resource_id, (boost.get(ev.resource_id) ?? 0) + w);
    }
  }
  for (const [k, v] of boost) boost.set(k, Math.max(-25, Math.min(25, v)));
  return boost;
}

/** Subjects students actually open — powers "Trending in JNTUH". */
export async function trendingSubjects(limit = 6): Promise<{ subject_id: string; clicks: number }[]> {
  const counts = new Map<string, number>();
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from("events").select("subject_id").eq("kind", "click").not("subject_id", "is", null).limit(5000);
    for (const row of data ?? []) counts.set(row.subject_id, (counts.get(row.subject_id) ?? 0) + 1);
  } else {
    for (const ev of await readEvents()) {
      if (ev.kind === "click" && ev.subject_id) counts.set(ev.subject_id, (counts.get(ev.subject_id) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([subject_id, clicks]) => ({ subject_id, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, limit);
}
