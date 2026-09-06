"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { updateProfile, type ProfilePatch } from "@/lib/users";

export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login?next=/profile");

  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const college = String(formData.get("college") ?? "").trim().slice(0, 120) || null;
  const branch_id = String(formData.get("branch_id") ?? "") || null;
  const regulation_id = String(formData.get("regulation_id") ?? "") || null;
  const yearRaw = Number(formData.get("year"));
  const semRaw = Number(formData.get("semester"));

  const patch: ProfilePatch = {
    name: name || session.name,
    college,
    branch_id,
    regulation_id,
    year: ([1, 2, 3, 4] as const).includes(yearRaw as 1 | 2 | 3 | 4) ? (yearRaw as 1 | 2 | 3 | 4) : null,
    semester: ([1, 2] as const).includes(semRaw as 1 | 2) ? (semRaw as 1 | 2) : null,
  };

  const res = await updateProfile(session.hall_ticket, patch);
  if (!res.ok) redirect(`/profile?error=${encodeURIComponent(res.error)}`);
  revalidatePath("/");
  revalidatePath("/profile");
  redirect("/profile?saved=1");
}
