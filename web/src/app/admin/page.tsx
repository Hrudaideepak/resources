import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllSubjects, getPendingResources } from "@/lib/repo";
import { RESOURCE_TYPE_LABEL } from "@/lib/types";
import { approveAction, rejectAction, runDiscoveryAction } from "./actions";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ ran?: string; found?: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const [{ ran, found }, pending, subjects] = await Promise.all([searchParams, getPendingResources(), getAllSubjects()]);
  const subjectName = new Map(subjects.map((s) => [s.id, `${s.name} (${s.regulation.name} ${s.year}-${s.semester})`]));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Moderation</h1>
        <p className="mt-1 text-sm text-stone-500">
          Signed in as <span className="font-mono">{session.hall_ticket}</span> (admin). Pending items never reach students
          until approved here.
        </p>
      </header>

      {ran != null && (
        <p className="rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
          Discovery agent scanned {ran} subjects → queued {found} new candidate{found === "1" ? "" : "s"} for review.
          {found === "0" && " (0 usually means no outbound network — discovery needs internet access, e.g. Vercel/cron.)"}
        </p>
      )}

      <section className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5">
        <div>
          <h2 className="font-semibold">🤖 Discovery agent</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Searches YouTube, GitHub and the open web, classifies results into the taxonomy, queues them here as pending.
          </p>
        </div>
        <form action={runDiscoveryAction} className="flex items-center gap-2">
          <input name="limit" type="number" min={1} max={20} defaultValue={5} className="w-16 rounded-lg border border-stone-300 px-2 py-1 text-sm" title="subjects to scan" />
          <button className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700">Run</button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">
          Pending queue <span className="font-normal normal-case text-stone-400">· {pending.length}</span>
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
            Nothing waiting. User submissions and agent discoveries will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
            {pending.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <span>{RESOURCE_TYPE_LABEL[r.type].emoji} {RESOURCE_TYPE_LABEL[r.type].label}</span>
                    <span>·</span>
                    <span className="truncate">{subjectName.get(r.subject_id) ?? r.subject_id}</span>
                    {r.unit_number != null && <span className="rounded bg-stone-100 px-1.5 py-0.5">Unit {r.unit_number}</span>}
                    {r.submitted_by && <span>· by {r.submitted_by}</span>}
                  </div>
                  <Link href={r.url} target="_blank" className="mt-0.5 block truncate font-medium text-indigo-700 hover:underline">
                    {r.title}
                  </Link>
                  {r.description && <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">{r.description}</p>}
                </div>
                <div className="flex gap-2">
                  <form action={approveAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Approve</button>
                  </form>
                  <form action={rejectAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-200">Reject</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
