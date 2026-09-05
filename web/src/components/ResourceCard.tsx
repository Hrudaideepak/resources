import type { Resource } from "@/lib/types";

const SOURCE_LABEL: Record<Resource["source"], string> = {
  jntuh: "Official · JNTUH",
  college: "College",
  youtube: "YouTube",
  website: "Web",
  github: "GitHub",
  telegram_public: "Telegram (public)",
  user: "Community",
};

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function ResourceCard({ r }: { r: Resource }) {
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow"
    >
      <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
        <span className={r.source === "jntuh" ? "font-semibold text-emerald-700" : ""}>{SOURCE_LABEL[r.source]}</span>
        <span className="font-mono">{host(r.url)}</span>
      </div>
      <div className="mt-1 font-medium leading-snug group-hover:text-indigo-700">{r.title}</div>
      {r.description && <p className="mt-1 text-sm text-stone-600 line-clamp-2">{r.description}</p>}
      <div className="mt-auto flex items-center gap-2 pt-3 text-xs text-stone-500">
        {r.unit_number != null && <span className="rounded bg-stone-100 px-1.5 py-0.5">Unit {r.unit_number}</span>}
        {r.submitted_by && <span>by {r.submitted_by}</span>}
        <span className="ml-auto" title="ranking score">
          ★ {r.score}
        </span>
      </div>
    </a>
  );
}
