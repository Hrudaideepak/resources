/**
 * V1 search: rule-based query understanding + fuzzy subject matching.
 *
 *   "dbms unit 3 important questions"
 *      → subject ≈ Database Management Systems, unit = 3, type = important_questions
 *
 * Later this becomes hybrid (pg_trgm + pgvector) — the interface stays the same.
 */
import type { ResourceType, SubjectWithContext } from "./types";

export interface ParsedQuery {
  raw: string;
  terms: string[]; // leftover words used for subject matching
  unit: number | null;
  type: ResourceType | null;
  regulation: string | null; // "r22"
  yearSem: { year: number; semester: number } | null;
}

const TYPE_PATTERNS: [RegExp, ResourceType][] = [
  [/\b(important|imp)\s*(questions?|qs?)\b/, "important_questions"],
  [/\b(previous|old|past|model)\s*(year\s*)?(question\s*)?(papers?|qp)\b/, "question_paper"],
  [/\b(pyqs?|qps?|question\s*papers?|papers?)\b/, "question_paper"],
  [/\bsyllabus\b/, "syllabus"],
  [/\b(videos?|lectures?|youtube|playlist|one\s*shot)\b/, "video"],
  [/\b(lab|labs|programs?|practicals?|record)\b/, "lab"],
  [/\b(textbooks?|books?|reference)\b/, "textbook"],
  [/\b(notes?|pdf|material)\b/, "notes"],
  [/\b(website|tutorial|article)s?\b/, "website"],
];

const ROMAN: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6 };

export function parseQuery(q: string): ParsedQuery {
  let s = q.toLowerCase().replace(/[^\w\s&+-]/g, " ").replace(/\s+/g, " ").trim();
  const out: ParsedQuery = { raw: q, terms: [], unit: null, type: null, regulation: null, yearSem: null };

  // unit
  const um = s.match(/\bunit\s*[-]?\s*(\d|i{1,3}|iv|v|vi)\b/);
  if (um) {
    out.unit = /\d/.test(um[1]) ? Number(um[1]) : ROMAN[um[1]];
    s = s.replace(um[0], " ");
  }
  // regulation
  const rm = s.match(/\b(r\s?(16|18|22|25))\b/);
  if (rm) {
    out.regulation = `r${rm[2]}`;
    s = s.replace(rm[0], " ");
  }
  // year-sem "3-1", "2nd year 1st sem"
  const ym = s.match(/\b([1-4])\s*[-\/]\s*([12])\b/);
  if (ym) {
    out.yearSem = { year: +ym[1], semester: +ym[2] };
    s = s.replace(ym[0], " ");
  }
  // resource type
  for (const [re, type] of TYPE_PATTERNS) {
    const m = s.match(re);
    if (m) {
      out.type = type;
      s = s.replace(m[0], " ");
      break;
    }
  }
  out.terms = s.split(/\s+/).filter((t) => t && !["for", "of", "the", "and", "cse", "jntuh", "btech"].includes(t));
  return out;
}

// --------------------------------------------------------------- matching
const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const acronym = (s: string) =>
  norm(s)
    .split(" ")
    .filter((w) => !["and", "of", "for", "the", "through", "in", "to"].includes(w))
    .map((w) => w[0])
    .join("");

export interface SubjectHit {
  subject: SubjectWithContext;
  score: number;
}

export function scoreSubject(terms: string[], s: SubjectWithContext): number {
  if (terms.length === 0) return 0;
  const name = norm(s.name);
  const short = s.short_name ? norm(s.short_name).replace(/ /g, "") : "";
  const acr = acronym(s.name);
  const aliases = s.aliases.map(norm);
  const code = s.code?.toLowerCase() ?? "";
  const q = terms.join(" ");
  const qc = q.replace(/ /g, "");

  let score = 0;
  if (code && qc === code) return 100;
  if (short && (qc === short || q === short)) score = Math.max(score, 95);
  if (qc === acr) score = Math.max(score, 92);
  if (name === q) score = Math.max(score, 100);
  if (aliases.some((a) => a === q || a.replace(/ /g, "") === qc)) score = Math.max(score, 90);
  if (name.includes(q)) score = Math.max(score, 80);
  if (aliases.some((a) => a.includes(q))) score = Math.max(score, 70);

  // per-word coverage
  const words = name.split(" ");
  const hit = terms.filter((t) => words.some((w) => w.startsWith(t)) || aliases.some((a) => a.includes(t))).length;
  if (hit) score = Math.max(score, Math.round((hit / terms.length) * 65));
  return score;
}

export function searchSubjects(parsed: ParsedQuery, all: SubjectWithContext[], limit = 12): SubjectHit[] {
  return all
    .filter((s) => !parsed.regulation || s.regulation.slug === parsed.regulation)
    .filter((s) => !parsed.yearSem || (s.year === parsed.yearSem.year && s.semester === parsed.yearSem.semester))
    .map((subject) => ({ subject, score: scoreSubject(parsed.terms, subject) }))
    .filter((h) => h.score >= 40 || (parsed.terms.length === 0 && (parsed.regulation || parsed.yearSem)))
    .sort((a, b) => b.score - a.score || b.subject.resource_count - a.subject.resource_count)
    .slice(0, limit);
}
