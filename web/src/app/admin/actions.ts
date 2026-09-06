"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getAllSubjects, getAllUnits, getPendingResources, insertPending, setResourceStatus } from "@/lib/repo";
import { discoverForSubject } from "@/lib/discover";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");
  return session;
}

export async function approveAction(formData: FormData) {
  await requireAdmin();
  await setResourceStatus(String(formData.get("id") ?? ""), "approved");
  revalidatePath("/admin");
}

export async function rejectAction(formData: FormData) {
  await requireAdmin();
  await setResourceStatus(String(formData.get("id") ?? ""), "rejected");
  revalidatePath("/admin");
}

/**
 * Runs the discovery agent against the most under-resourced subjects first
 * (self-prioritizing: it fills the biggest gaps). Everything it finds lands
 * in the pending queue — humans approve before anything goes public.
 */
export async function runDiscoveryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const limit = Math.min(Math.max(Number(formData.get("limit")) || 5, 1), 20);
  const [subjects, units, pending] = await Promise.all([getAllSubjects(), getAllUnits(), getPendingResources()]);
  const pendingUrls = new Set(pending.map((p) => p.url));

  const targets = subjects
    .filter((s) => s.kind === "theory" && !s.elective_group)
    .sort((a, b) => a.resource_count - b.resource_count)
    .slice(0, limit);

  let inserted = 0;
  for (const subject of targets) {
    try {
      const rows = (await discoverForSubject(subject, subjects, units)).filter((r) => !pendingUrls.has(r.url));
      inserted += rows.length ? await insertPending(rows) : 0;
    } catch {
      // a flaky connector must not kill the batch
    }
  }
  redirect(`/admin?ran=${targets.length}&found=${inserted}`);
}
