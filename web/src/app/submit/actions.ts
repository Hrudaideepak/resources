"use server";

import { redirect } from "next/navigation";
import { submitResource } from "@/lib/repo";
import type { ResourceType } from "@/lib/types";

const TYPES: ResourceType[] = ["notes", "question_paper", "syllabus", "video", "website", "textbook", "lab", "important_questions"];

export type SubmitState = { error?: string } | null;

export async function submitAction(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const url = String(form.get("url") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const type = String(form.get("type") ?? "") as ResourceType;
  const subject_id = String(form.get("subject_id") ?? "");
  const subject_slug = String(form.get("subject_slug") ?? "");
  const unitRaw = String(form.get("unit") ?? "");
  const description = String(form.get("description") ?? "");
  const submitted_by = String(form.get("submitted_by") ?? "");

  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) throw new Error();
  } catch {
    return { error: "Please paste a valid http(s) link." };
  }
  if (title.length < 4) return { error: "Give the resource a descriptive title." };
  if (!TYPES.includes(type)) return { error: "Pick a resource type." };
  if (!subject_id) return { error: "Pick a subject." };

  const res = await submitResource({
    url,
    title,
    type,
    subject_id,
    unit_number: unitRaw ? Number(unitRaw) : null,
    description,
    submitted_by,
  });
  if (!res.ok) return { error: res.error };
  redirect(`/subject/${subject_slug}?submitted=1`);
}
