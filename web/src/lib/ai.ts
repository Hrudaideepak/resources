/**
 * Subject AI assistant. Grounded RAG-lite: answers from the subject's official
 * syllabus units + indexed resources — never free-floating model memory.
 *
 * Providers:
 *  - OPENAI_API_KEY set  → OpenAI chat completions (AI_MODEL, default gpt-4o-mini)
 *  - otherwise           → deterministic offline answer composed from the same
 *                          grounding context, clearly labelled as offline.
 *
 * This is the interface; swapping providers or adding pgvector retrieval later
 * doesn't change callers.
 */
import type { Resource, SubjectWithContext, Unit } from "./types";
import { matchUnitByTopics, parseQuery } from "./search";

export interface AiAnswer {
  answer: string;
  citations: { title: string; url: string }[];
  offline: boolean;
}

const MAX_QUESTION = 500;

function buildContext(subject: SubjectWithContext, units: Unit[], resources: Resource[]) {
  const unitLines = units
    .map((u) => `Unit ${u.unit_number}: ${u.title}${u.topics ? ` — ${u.topics}` : ""}`)
    .join("\n");
  const resLines = resources
    .slice(0, 8)
    .map((r) => `- [${r.type}${r.unit_number ? ` · unit ${r.unit_number}` : ""}] ${r.title} (${r.url})`)
    .join("\n");
  return { unitLines, resLines };
}

export async function askAboutSubject(
  subject: SubjectWithContext,
  units: Unit[],
  resources: Resource[],
  questionRaw: string,
): Promise<AiAnswer> {
  const question = questionRaw.trim().slice(0, MAX_QUESTION);
  const { unitLines, resLines } = buildContext(subject, units, resources);
  const citations = resources.slice(0, 4).map((r) => ({ title: r.title, url: r.url }));

  const key = process.env.OPENAI_API_KEY;
  if (!key) return offlineAnswer(subject, units, resources, question, citations);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.AI_MODEL ?? "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 600,
        messages: [
          {
            role: "system",
            content: [
              `You are the JNTUH Hub subject assistant for "${subject.name}" (${subject.regulation.name}, ${subject.branch.code}, year ${subject.year}-${subject.semester}).`,
              "Answer ONLY using the official syllabus units and indexed resources below. If the question is outside the syllabus, say so briefly and suggest the closest unit.",
              "Be concise, student-friendly, exam-focused. End with 2-3 short follow-up questions the student could ask next, prefixed with 'Try:'.",
              "",
              `SYLLABUS:\n${unitLines || "(no unit data)"}`,
              "",
              `INDEXED RESOURCES:\n${resLines || "(none yet)"}`,
            ].join("\n"),
          },
          { role: "user", content: question },
        ],
      }),
    });
    if (!res.ok) throw new Error(`openai ${res.status}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const answer = json.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("empty answer");
    return { answer, citations, offline: false };
  } catch {
    // Graceful degradation: network/key failures fall back to the offline answer.
    return offlineAnswer(subject, units, resources, question, citations);
  } finally {
    clearTimeout(timer);
  }
}

/** No-LLM answer: syllabus mapping + best resources. Honest, never hallucinates. */
function offlineAnswer(
  subject: SubjectWithContext,
  units: Unit[],
  resources: Resource[],
  question: string,
  citations: { title: string; url: string }[],
): AiAnswer {
  const terms = parseQuery(question).terms;
  const match = matchUnitByTopics(terms, units);
  const lines: string[] = [];

  if (match?.unit) {
    lines.push(
      `Based on the ${subject.regulation.name} syllabus, that's **Unit ${match.unit.unit_number} — ${match.unit.title}**.`,
      "",
      `It covers: ${match.unit.topics ?? ""}`,
    );
  } else if (units.length) {
    lines.push(
      `The ${subject.regulation.name} syllabus for ${subject.name} has ${units.length} units:`,
      "",
      ...units.map((u) => `- Unit ${u.unit_number}: ${u.title}`),
    );
  }

  if (resources.length) {
    lines.push("", "Best indexed resources:", ...resources.slice(0, 3).map((r) => `- ${r.title}`));
  } else {
    lines.push("", "No resources indexed for this subject yet — add one from the Submit page.");
  }

  lines.push("", "_Offline summary (no OPENAI_API_KEY configured) — set it to get full AI answers grounded in this syllabus._");
  return { answer: lines.join("\n"), citations, offline: true };
}
