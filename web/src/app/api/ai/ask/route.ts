import { getSession } from "@/lib/auth";
import { logEvent } from "@/lib/events";
import { askAboutSubject } from "@/lib/ai";
import { getSubjectBySlug, getSubjectResources, getUnitsForSubject } from "@/lib/repo";

/**
 * Subject AI assistant. Requires login (interaction doubles as training signal:
 * the question is logged as a search event against the subject). Answers are
 * grounded in the official syllabus units + indexed resources — see lib/ai.ts.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "Log in to use the AI assistant." }, { status: 401 });
  }
  let body: { slug?: string; question?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  const slug = String(body.slug ?? "").slice(0, 160);
  const question = String(body.question ?? "").trim();
  if (!slug || question.length < 3 || question.length > 500) {
    return Response.json({ ok: false, error: "Ask a question between 3 and 500 characters." }, { status: 400 });
  }

  const subject = await getSubjectBySlug(slug);
  if (!subject) return Response.json({ ok: false, error: "Unknown subject." }, { status: 404 });

  const [units, resources] = await Promise.all([getUnitsForSubject(subject.id), getSubjectResources(subject.id)]);

  await logEvent({ user: session.hall_ticket, kind: "search", subject_id: subject.id, query: `ai: ${question}` });

  const answer = await askAboutSubject(subject, units, resources, question);
  return Response.json({ ok: true, ...answer });
}
