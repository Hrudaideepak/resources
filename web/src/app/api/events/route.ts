import { getSession } from "@/lib/auth";
import { logEvent } from "@/lib/events";
import type { EventKind } from "@/lib/types";

const KINDS = new Set<EventKind>(["search", "click", "up", "down"]);

/**
 * Interaction sink. Accepts JSON (also sendBeacon text payloads). Public:
 * sessions attach the hall ticket when present, anonymous events otherwise.
 * Spam affects only anonymous aggregates; moderation still gates content.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const kind = body.kind;
  if (typeof kind !== "string" || !KINDS.has(kind as EventKind)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const session = await getSession();
  await logEvent({
    user: session?.hall_ticket ?? null,
    kind: kind as EventKind,
    subject_id: typeof body.subject_id === "string" ? body.subject_id.slice(0, 120) : null,
    resource_id: typeof body.resource_id === "string" ? body.resource_id.slice(0, 120) : null,
    query: typeof body.query === "string" ? body.query.slice(0, 200) : null,
  });
  return Response.json({ ok: true });
}
