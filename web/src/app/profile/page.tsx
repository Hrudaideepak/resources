import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserByHallTicket, isProfileComplete } from "@/lib/users";
import { getBranches, getRegulations } from "@/lib/repo";
import { updateProfileAction } from "./actions";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; saved?: string; error?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/profile");
  const [{ welcome, saved, error }, profile, branches, regulations] = await Promise.all([
    searchParams,
    getUserByHallTicket(session.hall_ticket),
    getBranches(),
    getRegulations(),
  ]);
  if (!profile) redirect("/logout");

  const sel = "mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 focus:border-indigo-400 focus:outline-none";

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your profile</h1>
            <p className="mt-1 font-mono text-sm text-stone-500">{profile.hall_ticket} · {profile.role}</p>
          </div>
          {isProfileComplete(profile) && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">✓ personalized</span>}
        </div>

        {welcome && (
          <p className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
            👋 Welcome! Fill this in once — your homepage, search results and AI answers will follow your regulation, branch and semester.
          </p>
        )}
        {!isProfileComplete(profile) && !welcome && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Complete your profile to unlock &ldquo;My Semester&rdquo;, personalized search and syllabus-aware AI answers.
          </p>
        )}
        {saved && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Saved. ✓</p>}
        {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <form action={updateProfileAction} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="hall_ticket_ro">Hall ticket number</label>
            <input id="hall_ticket_ro" value={profile.hall_ticket} readOnly className={`${sel} bg-stone-50 font-mono text-stone-500`} />
            <p className="mt-1 text-xs text-stone-400">Your username — can&apos;t be changed.</p>
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="name">Full name</label>
            <input id="name" name="name" required maxLength={80} defaultValue={profile.name} className={sel} />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="college">College name</label>
            <input id="college" name="college" maxLength={120} defaultValue={profile.college ?? ""} placeholder="e.g. JNTUH UCEH / CBIT / VNR VJIET" className={sel} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium" htmlFor="regulation_id">Regulation</label>
              <select id="regulation_id" name="regulation_id" defaultValue={profile.regulation_id ?? ""} className={sel}>
                <option value="">Select…</option>
                {regulations.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} (from {r.applicable_from_year})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="branch_id">Branch</label>
              <select id="branch_id" name="branch_id" defaultValue={profile.branch_id ?? ""} className={sel}>
                <option value="">Select…</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.code} — {b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="year">Year of study</label>
              <select id="year" name="year" defaultValue={profile.year ?? ""} className={sel}>
                <option value="">Select…</option>
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>{["1st", "2nd", "3rd", "4th"][y - 1]} year</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="semester">Semester</label>
              <select id="semester" name="semester" defaultValue={profile.semester ?? ""} className={sel}>
                <option value="">Select…</option>
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">
            Save profile
          </button>
        </form>
      </div>
    </div>
  );
}
