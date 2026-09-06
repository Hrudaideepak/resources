/**
 * Data access layer.
 *  - If NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are set → Supabase (Postgres).
 *  - Otherwise → in-memory seed data (src/data) + a JSON file for submissions.
 * The rest of the app only talks to these functions.
 */
import fs from "node:fs/promises";
import path from "node:path";
import * as seed from "@/data/academic";
import { resources as seedResources } from "@/data/resources";
import { units as seedUnits } from "@/data/units";
import { popularityFor } from "./events";
import { getSupabase, getSupabaseAdmin } from "./supabase";
import type { Branch, College, Regulation, Resource, ResourceStatus, Subject, SubjectWithContext, Submission, Unit } from "./types";

// ------------------------------------------------------------ local store
// DATA_DIR resolved per call so scripts/tests can override it via env.
const DATA_DIR = () => process.env.DATA_DIR ?? path.join(process.cwd(), ".data");
const LOCAL_SUBMISSIONS = () => path.join(DATA_DIR(), "submissions.json");
const LOCAL_DISCOVERED = () => path.join(DATA_DIR(), "discovered.json");

async function readJsonFile<T>(file: string): Promise<T[]> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return [];
  }
}

const readLocalSubmissions = () => readJsonFile<Resource>(LOCAL_SUBMISSIONS());
const readLocalDiscovered = () => readJsonFile<Resource>(LOCAL_DISCOVERED());

/** Approved corpus in local mode = seeds + approved submissions + approved discoveries. */
async function localResources(): Promise<Resource[]> {
  const [subs, disc] = await Promise.all([readLocalSubmissions(), readLocalDiscovered()]);
  return [...seedResources, ...subs, ...disc.filter((r) => r.status === "approved")];
}

function withContext(s: Subject, count: number): SubjectWithContext {
  return {
    ...s,
    regulation: seed.regulations.find((r) => r.id === s.regulation_id)!,
    branch: seed.branches.find((b) => b.id === s.branch_id)!,
    resource_count: count,
  };
}

// ------------------------------------------------------------ taxonomy
export async function getColleges(): Promise<College[]> {
  const sb = getSupabase();
  if (!sb) return seed.colleges;
  const { data } = await sb.from("colleges").select("*").order("name");
  return (data as College[]) ?? [];
}

export async function getRegulations(): Promise<Regulation[]> {
  const sb = getSupabase();
  if (!sb) return seed.regulations;
  const { data } = await sb.from("regulations").select("*").order("applicable_from_year", { ascending: false });
  return (data as Regulation[]) ?? [];
}

export async function getBranches(): Promise<Branch[]> {
  const sb = getSupabase();
  if (!sb) return seed.branches;
  const { data } = await sb.from("branches").select("*").order("code");
  return (data as Branch[]) ?? [];
}

// ------------------------------------------------------------ subjects
export async function getSemesterSubjects(
  regulationSlug: string,
  branchSlug: string,
  year: number,
  semester: number,
): Promise<SubjectWithContext[]> {
  const sb = getSupabase();
  if (!sb) {
    const all = await localResources();
    return seed.subjects
      .filter((s) => {
        const reg = seed.regulations.find((r) => r.id === s.regulation_id)!;
        const br = seed.branches.find((b) => b.id === s.branch_id)!;
        return reg.slug === regulationSlug && br.slug === branchSlug && s.year === year && s.semester === semester;
      })
      .map((s) => withContext(s, all.filter((r) => r.subject_id === s.id && r.status === "approved").length));
  }
  const { data } = await sb
    .from("subjects")
    .select("*, regulation:regulations!inner(*), branch:branches!inner(*), resources(count)")
    .eq("regulation.slug", regulationSlug)
    .eq("branch.slug", branchSlug)
    .eq("year", year)
    .eq("semester", semester)
    .eq("resources.status", "approved");
  return ((data ?? []) as unknown[]).map((row) => {
    const r = row as Subject & { regulation: Regulation; branch: Branch; resources: { count: number }[] };
    return { ...r, resource_count: r.resources?.[0]?.count ?? 0 };
  });
}

export async function getSubjectBySlug(slug: string): Promise<SubjectWithContext | null> {
  const sb = getSupabase();
  if (!sb) {
    const s = seed.subjects.find((x) => x.slug === slug);
    if (!s) return null;
    const all = await localResources();
    return withContext(s, all.filter((r) => r.subject_id === s.id && r.status === "approved").length);
  }
  const { data } = await sb
    .from("subjects")
    .select("*, regulation:regulations(*), branch:branches(*), resources(count)")
    .eq("slug", slug)
    .eq("resources.status", "approved")
    .maybeSingle();
  if (!data) return null;
  const r = data as Subject & { regulation: Regulation; branch: Branch; resources: { count: number }[] };
  return { ...r, resource_count: r.resources?.[0]?.count ?? 0 };
}

export async function getAllSubjects(): Promise<SubjectWithContext[]> {
  const sb = getSupabase();
  if (!sb) {
    const all = await localResources();
    return seed.subjects.map((s) =>
      withContext(s, all.filter((r) => r.subject_id === s.id && r.status === "approved").length),
    );
  }
  const { data } = await sb.from("subjects").select("*, regulation:regulations(*), branch:branches(*), resources(count)").eq("resources.status", "approved");
  return ((data ?? []) as unknown[]).map((row) => {
    const r = row as Subject & { regulation: Regulation; branch: Branch; resources: { count: number }[] };
    return { ...r, resource_count: r.resources?.[0]?.count ?? 0 };
  });
}

// ------------------------------------------------------------ units
export async function getUnitsForSubject(subjectId: string): Promise<Unit[]> {
  const sb = getSupabase();
  if (!sb) {
    return seedUnits.filter((u) => u.subject_id === subjectId).sort((a, b) => a.unit_number - b.unit_number);
  }
  const { data } = await sb.from("units").select("*").eq("subject_id", subjectId).order("unit_number");
  return (data as Unit[]) ?? [];
}

/** All units — small today (~155 rows), used by topic search. Supersede with a SQL view at scale. */
export async function getAllUnits(): Promise<Unit[]> {
  const sb = getSupabase();
  if (!sb) return seedUnits;
  const { data } = await sb.from("units").select("*").order("subject_id").order("unit_number");
  return (data as Unit[]) ?? [];
}

// ------------------------------------------------------------ resources
export async function getSubjectResources(subjectId: string): Promise<Resource[]> {
  const sb = getSupabase();
  let base: Resource[];
  if (!sb) {
    base = (await localResources())
      .filter((r) => r.subject_id === subjectId && r.status === "approved")
      .sort((a, b) => b.score - a.score);
  } else {
    const { data } = await sb
      .from("resources")
      .select("*")
      .eq("subject_id", subjectId)
      .eq("status", "approved")
      .order("score", { ascending: false });
    base = (data as Resource[]) ?? [];
  }
  // Self-improving ranking: fold real usage (clicks/votes) into the seed score.
  const boost = await popularityFor(base.map((r) => r.id));
  if (!boost.size) return base;
  return base
    .map((r) => ({ ...r, score: Math.max(0, Math.min(100, r.score + (boost.get(r.id) ?? 0))) }))
    .sort((a, b) => b.score - a.score);
}

// ------------------------------------------------------------- moderation
/** Pending queue: user submissions (Supabase) + discovery agent candidates. */
export async function getPendingResources(): Promise<Resource[]> {
  const sb = getSupabase();
  if (!sb) return (await readLocalDiscovered()).filter((r) => r.status === "pending");
  const { data } = await sb.from("resources").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(200);
  return (data as Resource[]) ?? [];
}

export async function setResourceStatus(id: string, status: Extract<ResourceStatus, "approved" | "rejected">): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    const disc = await readLocalDiscovered();
    const i = disc.findIndex((r) => r.id === id && r.status === "pending");
    if (i === -1) return false; // only pending rows can transition — one-shot
    disc[i] = { ...disc[i], status };
    await fs.writeFile(LOCAL_DISCOVERED(), JSON.stringify(disc, null, 2));
    return true;
  }
  const { error } = await admin.from("resources").update({ status }).eq("id", id).eq("status", "pending");
  return !error;
}

/** Insert discovery candidates as pending resources. Returns rows written. */
export async function insertPending(candidates: Omit<Resource, "id" | "created_at" | "status">[]): Promise<number> {
  const stamped = candidates.map((c, i) => ({
    ...c,
    status: "pending" as const,
    id: `disc-${Date.now()}-${i}`,
    created_at: new Date().toISOString(),
  }));
  const sb = getSupabase();
  if (!sb) {
    const existing = await readLocalDiscovered();
    const seen = new Set(existing.map((r) => `${r.subject_id}|${r.url.toLowerCase()}`));
    const fresh = stamped.filter((r) => !seen.has(`${r.subject_id}|${r.url.toLowerCase()}`));
    if (!fresh.length) return 0;
    await fs.mkdir(path.dirname(LOCAL_DISCOVERED()), { recursive: true });
    await fs.writeFile(LOCAL_DISCOVERED(), JSON.stringify([...existing, ...fresh], null, 2));
    return fresh.length;
  }
  const { data, error } = await sb
    .from("resources")
    .upsert(
      stamped.map(({ id: _id, created_at: _c, ...rest }) => rest),
      { onConflict: "subject_id,url_hash", ignoreDuplicates: true },
    )
    .select("id");
  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

export async function submitResource(sub: Submission): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = getSupabase();
  const row: Omit<Resource, "id" | "created_at"> = {
    title: sub.title.trim(),
    url: sub.url.trim(),
    type: sub.type,
    source: "user",
    subject_id: sub.subject_id,
    unit_number: sub.unit_number,
    description: sub.description?.trim() || null,
    language: "en",
    status: "pending",
    score: 50,
    submitted_by: sub.submitted_by?.trim() || null,
  };
  if (!sb) {
    const list = await readLocalSubmissions();
    if (list.some((r) => r.subject_id === row.subject_id && r.url.toLowerCase() === row.url.toLowerCase())) {
      return { ok: false, error: "That link has already been submitted for this subject." };
    }
    // Local mode has no moderator → auto-approve so the contributor sees it immediately.
    list.push({ ...row, status: "approved", id: `local-${Date.now()}`, created_at: new Date().toISOString() });
    await fs.mkdir(path.dirname(LOCAL_SUBMISSIONS()), { recursive: true });
    await fs.writeFile(LOCAL_SUBMISSIONS(), JSON.stringify(list, null, 2));
    return { ok: true };
  }
  const { error } = await sb.from("resources").insert(row);
  if (error) {
    if (error.code === "23505") return { ok: false, error: "That link has already been submitted for this subject." };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
