"use client";

import { useActionState, useState } from "react";
import { RESOURCE_TYPE_LABEL, RESOURCE_TYPE_ORDER } from "@/lib/types";
import { submitAction, type SubmitState } from "./actions";

type Opt = { id: string; slug: string; label: string };

export default function SubmitForm({ subjects, initialSlug }: { subjects: Opt[]; initialSlug?: string }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitAction, null);
  const [sel, setSel] = useState<Opt>(subjects.find((s) => s.slug === initialSlug) ?? subjects[0]);
  const field = "mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
  const label = "block text-sm font-medium text-stone-700";

  return (
    <form action={action} className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="subject_id" value={sel.id} />
      <input type="hidden" name="subject_slug" value={sel.slug} />

      <div>
        <label className={label}>Subject</label>
        <select className={field} value={sel.id} onChange={(e) => setSel(subjects.find((s) => s.id === e.target.value)!)}>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>Link</label>
        <input name="url" type="url" required placeholder="https://…" className={field} />
      </div>

      <div>
        <label className={label}>Title</label>
        <input name="title" required minLength={4} placeholder="e.g. DBMS Unit 3 — Normalization notes" className={field} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Type</label>
          <select name="type" className={field} defaultValue="notes">
            {RESOURCE_TYPE_ORDER.map((t) => (
              <option key={t} value={t}>{RESOURCE_TYPE_LABEL[t].emoji} {RESOURCE_TYPE_LABEL[t].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Unit (optional)</label>
          <select name="unit" className={field} defaultValue="">
            <option value="">Whole subject</option>
            {[1, 2, 3, 4, 5].map((u) => (
              <option key={u} value={u}>Unit {u}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Why is it useful? (optional)</label>
        <textarea name="description" rows={2} className={field} placeholder="Covers exactly the R22 syllabus, good for last-minute revision…" />
      </div>

      <div>
        <label className={label}>Your name (optional, shown as contributor)</label>
        <input name="submitted_by" placeholder="Rahul · CSE 3rd year" className={field} />
      </div>

      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <button disabled={pending} className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
        {pending ? "Submitting…" : "Submit resource"}
      </button>
      <p className="text-center text-xs text-stone-500">Submissions are reviewed before appearing publicly. Don’t submit paid or pirated material.</p>
    </form>
  );
}
