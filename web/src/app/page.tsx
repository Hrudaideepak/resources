import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import SemesterPicker from "@/components/SemesterPicker";
import { getSession } from "@/lib/auth";
import { trendingSubjects } from "@/lib/events";
import { getAllSubjects, getBranches, getColleges, getRegulations, getSemesterSubjects } from "@/lib/repo";
import { getUserByHallTicket, isProfileComplete } from "@/lib/users";

export default async function Home() {
  const [colleges, regulations, branches, subjects, session] = await Promise.all([
    getColleges(),
    getRegulations(),
    getBranches(),
    getAllSubjects(),
    getSession(),
  ]);

  const profile = session ? await getUserByHallTicket(session.hall_ticket) : null;
  const myReg = profile?.regulation_id ? regulations.find((r) => r.id === profile.regulation_id) : undefined;
  const myBranch = profile?.branch_id ? branches.find((b) => b.id === profile.branch_id) : undefined;
  const mySem =
    profile && isProfileComplete(profile) && myReg && myBranch
      ? await getSemesterSubjects(myReg.slug, myBranch.slug, profile.year, profile.semester)
      : null;
  const myHref = myReg && myBranch && profile?.year && profile?.semester
    ? `/jntuh/${myReg.slug}/${myBranch.slug}/${profile.year}-${profile.semester}`
    : null;

  // Community learning loop: what students actually open, globally.
  const trendingIds = (await trendingSubjects(5)).map((t) => t.subject_id);
  const trending = trendingIds
    .map((id) => subjects.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s);

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

      {session && !isProfileComplete(profile) && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          👋 Hi {profile?.name?.split(" ")[0] ?? "there"} —{" "}
          <Link href="/profile" className="font-semibold underline">
            complete your profile
          </Link>{" "}
          (college, regulation, branch, year, semester) so the hub can pin your semester and personalize search + AI.
        </section>
      )}

      {mySem && myHref && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
              📚 My semester — {myReg!.name} {myBranch!.code} {profile!.year}-{profile!.semester}
            </h2>
            <Link href={myHref} className="text-xs text-indigo-600 hover:underline">
              open semester page →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {mySem.slice(0, 8).map((s) => (
              <Link
                key={s.id}
                href={`/subject/${s.slug}`}
                className="group rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-sm transition hover:border-indigo-300 hover:shadow"
              >
                <div className="text-xs font-mono text-stone-500">{s.code ?? s.elective_group ?? ""}</div>
                <div className="mt-1 font-semibold leading-snug group-hover:text-indigo-700">{s.name}</div>
                <div className="mt-2 text-xs text-stone-500">{s.resource_count} resources</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {trending.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">🔥 Trending / what students open</h2>
          <p className="mt-1 text-xs text-stone-400">Learned from real usage across the hub — no manual curation.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {trending.map((s) => (
              <Link
                key={s.id}
                href={`/subject/${s.slug}`}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm hover:border-indigo-300 hover:bg-indigo-50"
              >
                {s.short_name ?? s.name}
              </Link>
            ))}
          </div>
        </section>
      )}

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
