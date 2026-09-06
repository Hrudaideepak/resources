/**
 * CLI for the discovery agent — run manually or from cron/CI:
 *
 *   npm run discover -- --limit=10
 *
 * Scans the most under-resourced theory subjects first, classifies open-web
 * candidates into the taxonomy and queues them as PENDING (local mode:
 * .data/discovered.json; Supabase mode: resources.status='pending'). Nothing
 * goes public without moderator approval. Requires outbound network.
 */
import { subjects as allSubjects, regulations, branches } from "../src/data/academic";
import { units } from "../src/data/units";
import { resources } from "../src/data/resources";
import { classifyCandidate, discoverForSubject } from "../src/lib/discover";
import type { SubjectWithContext } from "../src/lib/types";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([\w-]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? "true"] : [];
  }).filter(Boolean) as [string, string][],
);
const limit = Math.min(Number(args.limit ?? 10) || 10, 40);

const withCtx = (id: string): SubjectWithContext => {
  const s = allSubjects.find((x) => x.id === id)!;
  return {
    ...s,
    regulation: regulations.find((r) => r.id === s.regulation_id)!,
    branch: branches.find((b) => b.id === s.branch_id)!,
    resource_count: resources.filter((r) => r.subject_id === s.id).length,
  };
};

async function main() {
  const ctx = allSubjects.map((s) => withCtx(s.id));
  const targets = ctx
    .filter((s) => s.kind === "theory" && !s.elective_group)
    .sort((a, b) => a.resource_count - b.resource_count)
    .slice(0, limit);

  const db = process.env.NEXT_PUBLIC_SUPABASE_URL ? "supabase" : "local .data/discovered.json";
  console.log(`discovery: ${targets.length} subjects, store=${db}`);
  const { insertPending } = await import("../src/lib/repo");

  let inserted = 0;
  for (const subject of targets) {
    process.stdout.write(`  ${subject.slug} … `);
    try {
      const rows = await discoverForSubject(subject, ctx, units);
      const n = rows.length ? await insertPending(rows) : 0;
      inserted += n;
      console.log(`${n} queued`);
    } catch (e) {
      console.log(`failed: ${e instanceof Error ? e.message : e}`);
    }
  }
  console.log(`done — ${inserted} candidates queued for moderation (/admin)`);
}

// allow `--selftest` to validate classification offline without network
if (args.selftest) {
  const ctx = allSubjects.map((s) => withCtx(s.id));
  const fixtures: [string, string, string | null][] = [
    ["Computer Networks Full Course | R22 JNTUH", "https://www.youtube.com/playlist?list=PLaaaaaaaa", "r22-cse-3-1-computer-networks"],
    ["DBMS Unit 3 Normalization Notes PDF", "https://example.com/dbms-normalization.pdf", "r22-cse-2-2-database-management-systems"],
    ["OS Lab Programs JNTUH", "https://github.com/foo/os-lab", "r22-cse-2-2-operating-systems-lab"],
    ["Best pizza in Hyderabad", "https://example.com/pizza", null],
  ];
  let pass = 0;
  for (const [title, url, want] of fixtures) {
    const got = classifyCandidate({ title, url, source: "website" }, ctx, units);
    const ok = (got?.subject.id ?? null) === want;
    console.log(`${ok ? "PASS" : "FAIL"} "${title}" → ${got?.subject.id ?? "rejected"}${got ? ` (${got.type}, u${got.unit_number ?? "-"}, ${got.confidence})` : ""}`);
    if (ok) pass++;
  }
  process.exit(pass === fixtures.length ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
