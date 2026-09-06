/**
 * Discovery agent — finds candidate resources on the open internet and
 * classifies them into the academic taxonomy (subject → unit → type).
 * Everything lands as status "pending" for human moderation; approved items
 * join the corpus, so the index grows on its own under supervision.
 *
 * Connectors (each degrades silently when its key/network is missing):
 *  - YouTube Data API v3        (YOUTUBE_API_KEY)
 *  - YouTube public search page (no key; best-effort scrape)
 *  - GitHub repository search   (no key, unauthenticated rate limits)
 *  - DuckDuckGo HTML endpoint   (no key; best-effort, can rate-limit)
 *
 * Needs outbound network — fine on Vercel/cron, unavailable in offline
 * sandboxes, in which case discovery simply returns zero candidates.
 */
import type { DiscoveredCandidate, Resource, ResourceType, SubjectWithContext, Unit } from "./types";
import { matchUnitByTopics, parseQuery } from "./search";

// ------------------------------------------------------------ classification
const TYPE_RULES: [RegExp, ResourceType][] = [
  [/youtube\.com|youtu\.be/i, "video"],
  [/github\.com/i, "lab"],
  [/question\s*papers?|pyq|previous\s*(year)?\s*papers?|old\s*papers?/i, "question_paper"],
  [/important\s*questions?/i, "important_questions"],
  [/syllabus/i, "syllabus"],
  [/unit\s*-?\s*\d|notes?|material|\.pdf(\?|$)/i, "notes"],
  [/lab(s|oratory)?\b|programs?\b/i, "lab"],
];

const normText = (s: string) => ` ${s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
const acronymOf = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => !["and", "of", "for", "the", "through", "in", "to"].includes(w))
    .map((w) => w[0])
    .join("");

/**
 * How strongly a candidate's text identifies a subject. Unlike user search,
 * the classifier sees machine titles like "DBMS Unit 3 Notes PDF" — so it
 * scores whole-word evidence: short name / acronym / alias / full name words.
 */
function subjectEvidence(subject: SubjectWithContext, hay: string): number {
  let best = 0;
  const short = subject.short_name?.toLowerCase();
  const acr = acronymOf(subject.name);
  const nameWords = subject.name.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  const nameHits = nameWords.filter((w) => hay.includes(` ${w} `)).length;
  const coverage = nameWords.length ? nameHits / nameWords.length : 0;

  if (short && short.length >= 2 && hay.includes(` ${short} `)) best = Math.max(best, 62);
  if (acr && acr.length >= 3 && hay.includes(` ${acr} `)) best = Math.max(best, 60);
  for (const alias of subject.aliases) {
    const a = normText(alias).trim();
    if (a.length >= 2 && hay.includes(` ${a} `)) best = Math.max(best, 55);
  }
  if (coverage >= 0.8) best = Math.max(best, 70);
  else if (coverage >= 0.5) best = Math.max(best, 50);
  return best;
}

export function classifyCandidate(
  c: DiscoveredCandidate,
  subjects: SubjectWithContext[],
  units: Unit[],
): { subject: SubjectWithContext; unit_number: number | null; type: ResourceType; confidence: number } | null {
  const hay = normText(`${c.title} ${c.description ?? ""}`);
  const scored = subjects
    .map((s) => ({ s, score: subjectEvidence(s, hay) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // The same subject name exists under multiple regulations (R22/R25). When the
  // text names one ("r22"), trust it; otherwise ties resolve to the OLDEST
  // regulation (the established canonical home; a moderator can re-map).
  const regSlug = parseQuery(c.title).regulation;
  const explicit = regSlug ? scored.filter((x) => x.s.regulation.slug === regSlug) : [];
  const pool = (explicit.length ? explicit : scored).sort(
    (a, b) =>
      b.score - a.score ||
      a.s.regulation.applicable_from_year - b.s.regulation.applicable_from_year ||
      b.s.resource_count - a.s.resource_count,
  );

  // cross-regulation duplicates ("Database Management Systems" vs R25's
  // "Data Base Management Systems") are the SAME subject concept — not ambiguous.
  // Theory vs lab ("Operating Systems" vs "OS Lab") genuinely differ, so resolve
  // by kind affinity with the resource type; only different concepts tie → reject.
  const type = TYPE_RULES.find(([re]) => re.test(c.url) || re.test(c.title))?.[1] ?? "website";
  const conceptKey = (s: SubjectWithContext) => (s.short_name ?? s.name).toLowerCase().replace(/[^a-z0-9]/g, "");
  const wantsLab = type === "lab";
  const byKind = (x: (typeof pool)[number]) => (x.s.kind === "lab" || x.s.kind === "skill" ? 1 : 0);
  pool.sort(
    (a, b) =>
      b.score - a.score ||
      (wantsLab ? byKind(b) - byKind(a) : byKind(a) - byKind(b)) ||
      a.s.regulation.applicable_from_year - b.s.regulation.applicable_from_year ||
      b.s.resource_count - a.s.resource_count,
  );

  const top = pool[0];
  if (!top || top.score < 50) return null; // no subject signal — don't guess
  if (pool[1] && pool[1].score === top.score && conceptKey(top.s) !== conceptKey(pool[1].s) && byKind(top) === byKind(pool[1])) {
    return null; // genuinely ambiguous
  }

  const parsed = parseQuery(`${c.title}`);
  const topicUnit = matchUnitByTopics(
    `${c.title} ${c.description ?? ""}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
    units.filter((u) => u.subject_id === top.s.id),
  );
  const explicitUnit = parsed.unit && parsed.unit >= 1 && parsed.unit <= 8 ? parsed.unit : null;
  return {
    subject: top.s,
    unit_number: explicitUnit ?? topicUnit?.unit?.unit_number ?? null,
    type,
    confidence: Math.min(100, top.score) / 100,
  };
}

// --------------------------------------------------------------- connectors
const UA = { "user-agent": "jntuh-hub-discovery/1.0 (+https://github.com/Hrudaideepak/resources)" };

async function fetchYouTube(subject: SubjectWithContext): Promise<DiscoveredCandidate[]> {
  const q = encodeURIComponent(`${subject.name} jntuh ${subject.regulation.name}`);
  const key = process.env.YOUTUBE_API_KEY;
  if (key) {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&maxResults=5&q=${q}&key=${key}`,
    );
    if (!res.ok) return [];
    const json = (await res.json()) as {
      items?: { id?: { playlistId?: string }; snippet?: { title?: string; description?: string } }[];
    };
    return (json.items ?? [])
      .filter((i) => i.id?.playlistId)
      .map((i) => ({
        title: i.snippet?.title ?? "YouTube playlist",
        url: `https://www.youtube.com/playlist?list=${i.id!.playlistId}`,
        description: i.snippet?.description,
        source: "youtube" as const,
      }));
  }
  // no key: scrape the public results page for playlist/video links
  const res = await fetch(`https://www.youtube.com/results?search_query=${q}`, { headers: UA }).catch(() => null);
  if (!res?.ok) return [];
  const html = await res.text();
  const out: DiscoveredCandidate[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/"playlistId":"(PL[\w-]+)"[^}]*?"title":\{"runs":\[\{"text":"([^"]{5,140})"/g)) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    out.push({ title: m[2], url: `https://www.youtube.com/playlist?list=${m[1]}`, source: "youtube" });
    if (out.length >= 4) break;
  }
  return out;
}

async function fetchGitHub(subject: SubjectWithContext): Promise<DiscoveredCandidate[]> {
  const q = encodeURIComponent(`${subject.short_name ?? subject.name} jntuh`);
  const res = await fetch(
    `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=3`,
    { headers: { ...UA, accept: "application/vnd.github+json" } },
  ).catch(() => null);
  if (!res?.ok) return [];
  const json = (await res.json()) as { items?: { full_name?: string; html_url?: string; description?: string | null }[] };
  return (json.items ?? [])
    .filter((i) => i.html_url)
    .map((i) => ({
      title: `${i.full_name} — GitHub`,
      url: i.html_url!,
      description: i.description ?? undefined,
      source: "github" as const,
    }));
}

async function fetchDDG(subject: SubjectWithContext): Promise<DiscoveredCandidate[]> {
  const q = encodeURIComponent(`${subject.name} ${subject.regulation.name} jntuh notes pdf`);
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, { headers: UA }).catch(() => null);
  if (!res?.ok) return [];
  const html = await res.text();
  const out: DiscoveredCandidate[] = [];
  for (const m of html.matchAll(/class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]{5,140})<\/a>/g)) {
    const url = decodeURIComponent(m[1].replace(/.*uddg=/, "").split("&")[0]);
    if (!/^https?:\/\//.test(url) || /youtube\.com|duckduckgo/.test(url)) continue;
    out.push({ title: m[2].trim(), url, source: "website" });
    if (out.length >= 4) break;
  }
  return out;
}

// ------------------------------------------------------------ orchestration
export async function discoverForSubject(
  subject: SubjectWithContext,
  allSubjects: SubjectWithContext[],
  units: Unit[],
  opts: { youtube?: boolean; github?: boolean; web?: boolean } = {},
): Promise<Omit<Resource, "id" | "created_at" | "status">[]> {
  const use = { youtube: true, github: true, web: true, ...opts };
  const found = (
    await Promise.allSettled([
      use.youtube ? fetchYouTube(subject) : [],
      use.github ? fetchGitHub(subject) : [],
      use.web ? fetchDDG(subject) : [],
    ])
  ).flatMap((r) => (r.status === "fulfilled" ? r.value : []));

  const rows: Omit<Resource, "id" | "created_at" | "status">[] = [];
  const seen = new Set<string>();
  for (const c of found) {
    if (seen.has(c.url)) continue;
    seen.add(c.url);
    const hit = classifyCandidate(c, allSubjects, units);
    if (!hit || hit.subject.id !== subject.id) continue;
    rows.push({
      title: c.title.slice(0, 150),
      url: c.url,
      type: hit.type,
      source: c.source,
      subject_id: subject.id,
      unit_number: hit.unit_number,
      description: `Auto-discovered (${Math.round(hit.confidence * 100)}% match). ${c.description ?? ""}`.trim().slice(0, 400),
      language: "en",
      score: Math.round(40 + hit.confidence * 20), // starts mid-range; votes re-rank it
      submitted_by: "discovery-agent",
    });
  }
  return rows.slice(0, 8);
}
