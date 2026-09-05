import { getAllSubjects } from "@/lib/repo";
import SubmitForm from "./SubmitForm";

export default async function SubmitPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const { subject } = await searchParams;
  const subjects = (await getAllSubjects())
    .sort((a, b) => a.regulation.slug.localeCompare(b.regulation.slug) || a.year - b.year || a.semester - b.semester || a.name.localeCompare(b.name))
    .map((s) => ({
      id: s.id,
      slug: s.slug,
      label: `${s.regulation.name} · ${s.branch.code} ${s.year}-${s.semester} · ${s.name}${s.code ? ` (${s.code})` : ""}`,
    }));
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Add a resource</h1>
        <p className="mt-1 text-stone-600">
          Paste a link to notes, a question paper, a YouTube playlist, a tutorial — anything that helped you. We only store the link and
          attribute the original source.
        </p>
      </header>
      <SubmitForm subjects={subjects} initialSlug={subject} />
    </div>
  );
}
