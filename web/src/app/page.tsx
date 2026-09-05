import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import SemesterPicker from "@/components/SemesterPicker";
import { getAllSubjects, getBranches, getColleges, getRegulations } from "@/lib/repo";

export default async function Home() {
  const [colleges, regulations, branches, subjects] = await Promise.all([
    getColleges(),
    getRegulations(),
    getBranches(),
    getAllSubjects(),
  ]);

  const popular = subjects
    .filter((s) => s.kind === "theory" && !s.elective_group)
    .sort((a, b) => b.resource_count - a.resource_count)
    .slice(0, 8);

  const theoryCount = subjects.filter((s) => s.kind === "theory").length;
  const resourceCount = subjects.reduce((n, s) => n + s.resource_count, 0);

  return (
    <div className="space-y-10">
      <section className="pt-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Everything for your <span className="text-indigo-600">semester</span>.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          Notes · Papers · Videos · Labs · Syllabus — organised by regulation, branch, semester and subject, so you stop asking
          “where is the DBMS PDF?”
        </p>
        <div className="mx-auto mt-6 max-w-2xl">
          <SearchBox />
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Try:{" "}
          {["dbms unit 3 important questions", "cn previous papers", "r25 2-2", "os lab programs"].map((q) => (
            <Link key={q} href={`/search?q=${encodeURIComponent(q)}`} className="mx-1 rounded-full bg-stone-100 px-2 py-0.5 hover:bg-stone-200">
              {q}
            </Link>
          ))}
        </p>
      </section>

      <SemesterPicker colleges={colleges} regulations={regulations} branches={branches} />

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Popular subjects</h2>
          <p className="text-xs text-stone-500">
            {subjects.length} subjects · {theoryCount} theory · {resourceCount} resources indexed
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((s) => (
            <Link
              key={s.id}
              href={`/subject/${s.slug}`}
              className="group rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow"
            >
              <div className="text-xs font-mono text-stone-500">
                {s.regulation.name} · {s.branch.code} · {s.year}-{s.semester}
              </div>
              <div className="mt-1 font-semibold leading-snug group-hover:text-indigo-700">{s.name}</div>
              <div className="mt-2 text-xs text-stone-500">{s.resource_count} resources</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {regulations.map((r) => (
          <div key={r.id} className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold">JNTUH {r.name} · B.Tech CSE</h3>
              <span className="text-xs text-stone-500">from AY {r.applicable_from_year}-{String(r.applicable_from_year + 1).slice(2)}</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].flatMap((y) =>
                [1, 2].map((s) => (
                  <Link
                    key={`${y}-${s}`}
                    href={`/jntuh/${r.slug}/cse/${y}-${s}`}
                    className="rounded-lg border border-stone-200 py-2 text-center text-sm font-mono hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    {y}-{s}
                  </Link>
                )),
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
