/**
 * Self-checks for the auth + learning loop + AI fallback. No network needed.
 *   npm run verify
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "jntuh-verify-"));

let failures = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failures++;
};

async function main() {
  const { normalizeHallTicket, isValidHallTicket, signSession, verifySessionToken } = await import("../src/lib/auth");
  const { registerUser, authenticate, updateProfile, getUserByHallTicket, isProfileComplete } = await import("../src/lib/users");
  const { logEvent } = await import("../src/lib/events");
  const { insertPending, getPendingResources, setResourceStatus, getSubjectResources } = await import("../src/lib/repo");
  const { askAboutSubject } = await import("../src/lib/ai");
  const { subjects, regulations, branches } = await import("../src/data/academic");
  const { units } = await import("../src/data/units");

  // ---- hall ticket rules
  check("hall ticket normalize", normalizeHallTicket(" 22a81a0501 ") === "22A81A0501");
  check("hall ticket valid", isValidHallTicket("22A81A0501") && !isValidHallTicket("22A81A050"));

  // ---- JWT round trip
  const token = await signSession({ hall_ticket: "22A81A0501", name: "Test", role: "student" });
  check("jwt roundtrip", (await verifySessionToken(token))?.hall_ticket === "22A81A0501");
  check("jwt rejects tampering", (await verifySessionToken(token.slice(0, -2) + "xx")) === null);

  // ---- user lifecycle (local store)
  const reg = await registerUser("22A81A0501", "Test Student", "supersecret1");
  check("register ok", reg.ok === true);
  check("duplicate register rejected", (await registerUser("22A81A0501", "X", "supersecret1")).ok === false);
  check("login good password", (await authenticate("22a81a0501", "supersecret1"))?.hall_ticket === "22A81A0501");
  check("login bad password rejected", (await authenticate("22A81A0501", "wrong-password")) === null);
  const upd = await updateProfile("22A81A0501", { college: "JNTUH UCEH", branch_id: "btech-cse", regulation_id: "jntuh-r22", year: 2, semester: 2 });
  check("profile update", upd.ok === true);
  check("profile complete after fill", isProfileComplete(await getUserByHallTicket("22A81A0501")));

  // ---- events → ranking boost (self-improving)
  const target = "r22-cse-2-2-database-management-systems";
  const before = await getSubjectResources(target);
  const low = before[before.length - 1];
  for (let i = 0; i < 6; i++) await logEvent({ kind: "up", resource_id: low.id, subject_id: target });
  const after = await getSubjectResources(target);
  const reRanked = after.find((r) => r.id === low.id)!;
  check("upvotes raise effective score", reRanked.score > low.score);
  check("boost clamped to 25", reRanked.score - low.score <= 25);

  // ---- discovery queue → moderation → corpus (local)
  const inserted = await insertPending([
    { title: "DBMS notes", url: "https://example.com/dbms-notes", type: "notes", source: "website", subject_id: target, unit_number: 3, description: "test", language: "en", score: 50, submitted_by: "test" },
  ]);
  check("pending insert", inserted === 1);
  check("pending insert dedupes", (await insertPending([
    { title: "DBMS notes", url: "https://example.com/dbms-notes", type: "notes", source: "website", subject_id: target, unit_number: 3, description: "test", language: "en", score: 50, submitted_by: "test" },
  ])) === 0);
  const pending = await getPendingResources();
  const p = pending.find((r) => r.url === "https://example.com/dbms-notes")!;
  check("pending listed", !!p);
  check("approve flips status", await setResourceStatus(p.id, "approved"));
  check("approved joins corpus", (await getSubjectResources(target)).some((r) => r.url === "https://example.com/dbms-notes"));
  check("approve is one-shot", (await setResourceStatus(p.id, "rejected")) === false);

  // ---- offline AI fallback (no OPENAI_API_KEY in this environment)
  const dbms = { ...subjects.find((s) => s.id === target)!, regulation: regulations.find((r) => r.slug === "r22")!, branch: branches[0], resource_count: 1 };
  const ai = await askAboutSubject(dbms, units.filter((u) => u.subject_id === target), [], "explain normalization");
  check("offline ai grounded in syllabus", ai.offline === true && ai.answer.includes("Unit 3"));

  console.log(failures ? `\n${failures} FAILED` : "\nall checks passed");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
