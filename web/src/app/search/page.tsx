import Link from "next/link";
import ResourceCard from "@/components/ResourceCard";
import SearchBox from "@/components/SearchBox";
import { getSession } from "@/lib/auth";
import { logEvent } from "@/lib/events";
import { getAllSubjects, getAllUnits, getSubjectResources } from "@/lib/repo";
import { getUserByHallTicket } from "@/lib/users";
import { parseQuery, searchSubjects } from "@/lib/search";
import { RESOURCE_TYPE_LABEL } from "@/lib/types";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const parsed = parseQuery(q);
  const [all, allUnits, session] = await Promise.all([getAllSubjects(), getAllUnits(), getSession()]);

  // Personalization: boost the student's own regulation + branch (from their profile).
  const profile = session ? await getUserByHallTicket(session.hall_ticket) : null;
  const bias = profile
    ? {
        regulationSlug: all.find((s) => s.regulation.id === profile.regulation_id)?.regulation.slug,
        branchSlug: all.find((s) => s.branch.id === profile.branch_id)?.branch.slug,
      }
    : undefined;

  const hits = q ? searchSubjects(parsed, all, allUnits, 12, bias) : [];

  // Every search is interaction data — it teaches the engine what students need.
  if (q && parsed.terms.length) {
    await logEvent({ user: session?.hall_ticket ?? null, kind: "search", subject_id: hits[0]?.subject.id ?? null, query: q }).catch(() => {});
  }

  // For the top hit, pull matching resources straight onto the page.
  const top = hits[0];
  // No explicit "unit N" in the query? The search already inferred one from syllabus topics.
  const inferredUnit = top && parsed.unit == null ? top.unit : null;
  const effectiveUnit = parsed.unit ?? inferredUnit?.unit_number ?? null;
  const matchedUnit = effectiveUnit != null ? allUnits.find((u) => u.subject_id === top.subject.id && u.unit_number === effectiveUnit) : undefined;

  const topResources = top
    ? (await getSubjectResources(top.subject.id)).filter(
        (r) =>
          (parsed.type == null || r.type === parsed.type) &&
          (effectiveUnit == null || r.unit_number === effectiveUnit || r.unit_number == null),
      )
    : [];

  const chips: string[] = [];
  if (parsed.terms.length) chips.push(`subject ≈ “${parsed.terms.join(" ")}”`);
  if (parsed.unit) chips.push(`unit ${parsed.unit}`);
  if (inferredUnit) chips.push(`unit ${inferredUnit.unit_number} (matched via syllabus)`);
  if (parsed.type) chips.push(RESOURCE_TYPE_LABEL[parsed.type].label.toLowerCase());
  if (parsed.regulation) chips.push(parsed.regulation.toUpperCase());
  if (parsed.yearSem) chips.push(`${parsed.yearSem.year}-${parsed.yearSem.semester}`);

  return (
    <div className="space-y-8">
      <SearchBox initial={q} size="sm" autoFocus={!q} />

      {q && (
        <p className="text-sm text-stone-500">
          Understood as: {chips.length ? chips.map((c) => <span key={c} className="mr-1 rounded-full bg-stone-100 px-2 py-0.5">{c}</span>) : "—"}
        </p>
      )}

      {q && hits.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
          No subject matched “{q}”. Try a subject name or short form like <em>dbms</em>, <em>cn</em>, <em>daa</em>.
        </div>
      )}

      {top && (
        <section className="rounded-3xl border border-indigo-200 bg-indigo-50/50 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">⭐ Best match</div>
              <Link href={`/subject/${top.subject.slug}`} className="text-2xl font-bold hover:underline">
                {top.subject.name}
              </Link>
              <div className="font-mono text-xs text-stone-500">
                {top.subject.regulation.name} · {top.subject.branch.code} · {top.subject.year}-{top.subject.semester}
                {top.subject.code && ` · ${top.subject.code}`}
              </div>
              {matchedUnit && (
                <div className="mt-2 text-sm">
                  🎯{" "}
                  <Link href={`/subject/${top.subject.slug}?unit=${matchedUnit.unit_number}`} className="font-medium text-indigo-700 hover:underline">
                    Unit {matchedUnit.unit_number}: {matchedUnit.title}
                  </Link>
                  <span className="ml-1 text-xs text-stone-400">
                    {parsed.unit ? "from your query" : "matched from syllabus topics"}
                  </span>
                </div>
              )}
            </div>
            <Link href={`/subject/${top.subject.slug}`} className="text-sm text-indigo-700 hover:underline">
              Open subject page →
            </Link>
          </div>
          {topResources.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {topResources.slice(0, 6).map((r) => (
                <ResourceCard key={r.id} r={r} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-stone-600">
              No {parsed.type ? RESOURCE_TYPE_LABEL[parsed.type].label.toLowerCase() : "resources"} indexed yet for this subject.{" "}
              <Link href={`/submit?subject=${top.subject.slug}`} className="text-indigo-700 underline">
                Add one
              </Link>
              .
            </p>
          )}
        </section>
      )}

      {hits.length > 1 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">Other matches</h2>
          <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
            {hits.slice(1).map((h) => (
              <li key={h.subject.id}>
                <Link
                  href={`/subject/${h.subject.slug}${h.unit ? `?unit=${h.unit.unit_number}` : ""}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-stone-50"
                >
                  <span>
                    <span className="font-medium">{h.subject.name}</span>
                    <span className="ml-2 font-mono text-xs text-stone-500">
                      {h.subject.regulation.name} · {h.subject.year}-{h.subject.semester}
                    </span>
                    {parsed.unit == null && h.unit && (
                      <span className="ml-2 text-xs text-indigo-600">
                        🎯 Unit {h.unit.unit_number}: {h.unit.title}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-stone-500">{h.subject.resource_count} resources</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
