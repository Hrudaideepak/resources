import Link from "next/link";
import { notFound } from "next/navigation";
import AskAI from "@/components/AskAI";
import ResourceCard from "@/components/ResourceCard";
import { getSession } from "@/lib/auth";
import { getSubjectBySlug, getSubjectResources, getUnitsForSubject } from "@/lib/repo";
import { RESOURCE_TYPE_LABEL, RESOURCE_TYPE_ORDER, type ResourceType } from "@/lib/types";

export default async function SubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ unit?: string; type?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const subject = await getSubjectBySlug(slug);
  if (!subject) notFound();

  const [all, units, session] = await Promise.all([
    getSubjectResources(subject.id),
    getUnitsForSubject(subject.id),
    getSession(),
  ]);
  const unitFilter = sp.unit ? Number(sp.unit) : null;
  const typeFilter = (sp.type as ResourceType | undefined) ?? null;
  const activeUnit = unitFilter != null ? units.find((u) => u.unit_number === unitFilter) : undefined;

  const filtered = all.filter(
    (r) => (unitFilter == null || r.unit_number === unitFilter || r.unit_number == null) && (typeFilter == null || r.type === typeFilter),
  );
  const groups = RESOURCE_TYPE_ORDER.map((t) => ({ type: t, items: filtered.filter((r) => r.type === t) })).filter((g) => g.items.length);
  const unitsPresent = Array.from(new Set(all.map((r) => r.unit_number).filter((u): u is number => u != null))).sort();
  // Chips come from the syllabus when we have it, else from the units that have resources.
  const unitChips = units.length ? units.map((u) => u.unit_number) : unitsPresent;
  const resourcesByUnit = (n: number) => all.filter((r) => r.unit_number === n).length;

  const semHref = `/jntuh/${subject.regulation.slug}/${subject.branch.slug}/${subject.year}-${subject.semester}`;
  const q = (p: { unit?: number | null; type?: ResourceType | null }) => {
    const u = p.unit === undefined ? unitFilter : p.unit;
    const t = p.type === undefined ? typeFilter : p.type;
    const s = new URLSearchParams();
    if (u != null) s.set("unit", String(u));
    if (t) s.set("type", t);
    const str = s.toString();
    return `/subject/${subject.slug}${str ? `?${str}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:underline">Home</Link> /{" "}
        <Link href={semHref} className="hover:underline">
          {subject.regulation.name} {subject.branch.code} {subject.year}-{subject.semester}
        </Link>{" "}
        / <span className="text-stone-900">{subject.short_name ?? subject.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-stone-500">
            {subject.code ?? subject.elective_group ?? ""} · {subject.regulation.name} · {subject.branch.code} · {subject.year}-{subject.semester}
            {subject.credits != null && ` · ${subject.credits} credits`}
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{subject.name}</h1>
          {subject.aliases.length > 0 && (
            <p className="mt-1 text-sm text-stone-500">
              {subject.elective_group ? "Options: " : "Also known as: "}
              {subject.aliases.join(", ")}
            </p>
          )}
        </div>
        <Link
          href={`/submit?subject=${subject.slug}`}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add resource
        </Link>
      </header>

      {/* course outline — official syllabus units */}
      {units.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">
            📊 Course outline <span className="font-normal normal-case text-stone-400">· official syllabus, {units.length} units — pick a unit to filter resources</span>
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {units.map((u) => {
              const count = resourcesByUnit(u.unit_number);
              const active = unitFilter === u.unit_number;
              return (
                <Link
                  key={u.id}
                  href={q({ unit: u.unit_number, type: null })}
                  className={`group rounded-2xl border p-4 transition-colors ${
                    active ? "border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-300" : "border-stone-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600">Unit {u.unit_number}</span>
                    <span className="text-xs text-stone-400">{count > 0 ? `${count} resource${count === 1 ? "" : "s"}` : "no resources yet"}</span>
                  </div>
                  <div className="mt-1 font-semibold leading-snug group-hover:underline">{u.title}</div>
                  {u.topics && <p className="mt-1 line-clamp-2 text-xs text-stone-500">{u.topics}</p>}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <AskAI slug={subject.slug} subjectName={subject.short_name ?? subject.name} loggedIn={!!session} />

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-stone-500">Type:</span>
        <Link href={q({ type: null })} className={`rounded-full px-3 py-1 ${!typeFilter ? "bg-stone-900 text-white" : "bg-stone-100 hover:bg-stone-200"}`}>
          All
        </Link>
        {RESOURCE_TYPE_ORDER.map((t) => (
          <Link key={t} href={q({ type: t })} className={`rounded-full px-3 py-1 ${typeFilter === t ? "bg-stone-900 text-white" : "bg-stone-100 hover:bg-stone-200"}`}>
            {RESOURCE_TYPE_LABEL[t].emoji} {RESOURCE_TYPE_LABEL[t].label}
          </Link>
        ))}
        {unitChips.length > 0 && (
          <>
            <span className="ml-3 text-stone-500">Unit:</span>
            <Link href={q({ unit: null })} className={`rounded-full px-3 py-1 ${unitFilter == null ? "bg-stone-900 text-white" : "bg-stone-100 hover:bg-stone-200"}`}>
              All
            </Link>
            {unitChips.map((u) => (
              <Link
                key={u}
                href={q({ unit: u })}
                title={units.find((x) => x.unit_number === u)?.title}
                className={`rounded-full px-3 py-1 ${unitFilter === u ? "bg-stone-900 text-white" : "bg-stone-100 hover:bg-stone-200"}`}
              >
                {u}
              </Link>
            ))}
          </>
        )}
      </div>

      {/* active unit context */}
      {activeUnit && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 px-4 py-3 text-sm">
          <span className="font-semibold text-indigo-900">
            Unit {activeUnit.unit_number} — {activeUnit.title}
          </span>
          {activeUnit.topics && <span className="mt-0.5 block text-xs text-stone-500">Covers: {activeUnit.topics}</span>}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
          No resources here yet.{" "}
          <Link href={`/submit?subject=${subject.slug}`} className="text-indigo-600 underline">
            Add the first one
          </Link>
          .
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.type}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">
              {RESOURCE_TYPE_LABEL[g.type].emoji} {RESOURCE_TYPE_LABEL[g.type].label}{" "}
              <span className="font-normal normal-case text-stone-400">· {g.items.length}</span>
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {g.items.map((r) => (
                <ResourceCard key={r.id} r={r} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
