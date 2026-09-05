import Link from "next/link";
import { notFound } from "next/navigation";
import { getSemesterSubjects } from "@/lib/repo";
import type { SubjectKind } from "@/lib/types";

const KIND_LABEL: Record<SubjectKind, string> = {
  theory: "Theory",
  lab: "Labs",
  skill: "Skill courses",
  project: "Projects / Internship",
  mandatory: "Mandatory (non-credit)",
};
const KIND_ORDER: SubjectKind[] = ["theory", "lab", "skill", "project", "mandatory"];

export default async function SemesterPage({
  params,
}: {
  params: Promise<{ college: string; regulation: string; branch: string; sem: string }>;
}) {
  const { college, regulation, branch, sem } = await params;
  const m = sem.match(/^([1-4])-([12])$/);
  if (!m) notFound();
  const year = +m[1];
  const semester = +m[2];

  const subjects = await getSemesterSubjects(regulation, branch, year, semester);
  if (subjects.length === 0) notFound();

  const groups = KIND_ORDER.map((k) => ({ kind: k, items: subjects.filter((s) => s.kind === k) })).filter((g) => g.items.length);
  const total = subjects.reduce((n, s) => n + s.resource_count, 0);

  const nav = (y: number, s: number) => `/${college}/${regulation}/${branch}/${y}-${s}`;

  return (
    <div className="space-y-8">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:underline">Home</Link> / {college.toUpperCase()} / {regulation.toUpperCase()} / {branch.toUpperCase()} /{" "}
        <span className="text-stone-900">{year}-{semester}</span>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {branch.toUpperCase()} {year}-{semester}
          </h1>
          <p className="mt-1 text-stone-600">
            JNTUH {regulation.toUpperCase()} · {subjects.length} subjects · {total} resources
          </p>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].flatMap((y) =>
            [1, 2].map((s) => (
              <Link
                key={`${y}${s}`}
                href={nav(y, s)}
                className={`rounded-md px-2 py-1 font-mono text-xs ${
                  y === year && s === semester ? "bg-indigo-600 text-white" : "bg-stone-100 hover:bg-stone-200"
                }`}
              >
                {y}-{s}
              </Link>
            )),
          )}
        </div>
      </header>

      {groups.map((g) => (
        <section key={g.kind}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">{KIND_LABEL[g.kind]}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((s) => (
              <Link
                key={s.id}
                href={`/subject/${s.slug}`}
                className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow"
              >
                <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                  <span>{s.code ?? s.elective_group ?? "—"}</span>
                  {s.credits != null && <span>{s.credits} cr</span>}
                </div>
                <div className="mt-1 font-semibold leading-snug group-hover:text-indigo-700">{s.name}</div>
                {s.short_name && <div className="text-xs text-stone-500">{s.short_name}</div>}
                <div className="mt-auto pt-3 text-xs text-stone-500">
                  {s.resource_count > 0 ? `${s.resource_count} resources` : "No resources yet — be the first to add"}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
