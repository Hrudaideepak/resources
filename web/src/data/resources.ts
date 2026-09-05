/**
 * Seed resources. Only *links* are stored — never re-hosted files.
 * Official JNTUH PDFs + a handful of well-known public references so the UI
 * isn't empty. Everything else should come through /submit.
 */
import type { Resource } from "@/lib/types";

const now = "2026-09-01T00:00:00Z";
let n = 0;
const r = (
  subject_id: string,
  type: Resource["type"],
  source: Resource["source"],
  title: string,
  url: string,
  opts: Partial<Resource> = {},
): Resource => ({
  id: `seed-${++n}`,
  title,
  url,
  type,
  source,
  subject_id,
  unit_number: null,
  description: null,
  language: "en",
  status: "approved",
  score: 70,
  submitted_by: null,
  created_at: now,
  ...opts,
});

const R22_PDF = "https://jntuh.ac.in/uploads/academics/R22B.Tech.CSECourseStructureSyllabus.pdf";
const R25_PDF = "https://jntuh.ac.in/uploads/academics/R25B.TECH.CSECourseStructure.pdf";

export const resources: Resource[] = [
  // ---- syllabus (official) — attached to a few core subjects
  ...[
    "r22-cse-2-2-database-management-systems",
    "r22-cse-2-2-operating-systems",
    "r22-cse-3-1-computer-networks",
    "r22-cse-3-1-design-and-analysis-of-algorithms",
    "r22-cse-2-1-data-structures",
    "r22-cse-3-2-machine-learning",
    "r22-cse-4-1-compiler-design",
  ].map((s) =>
    r(s, "syllabus", "jntuh", "Official JNTUH R22 CSE Course Structure & Syllabus (PDF)", R22_PDF, {
      score: 100,
      description: "Full R22 syllabus for all 8 semesters. Find this subject by its course code.",
    }),
  ),
  ...[
    "r25-cse-2-1-data-base-management-systems",
    "r25-cse-2-2-operating-systems",
    "r25-cse-2-2-computer-networks",
    "r25-cse-1-2-data-structures",
  ].map((s) =>
    r(s, "syllabus", "jntuh", "Official JNTUH R25 CSE Course Structure (PDF)", R25_PDF, {
      score: 100,
      description: "Course structure for R25, applicable from AY 2025-26.",
    }),
  ),

  // ---- DBMS (R22 2-2)
  r("r22-cse-2-2-database-management-systems", "video", "youtube", "DBMS Complete Course — Gate Smashers", "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y", { score: 90 }),
  r("r22-cse-2-2-database-management-systems", "website", "website", "GeeksforGeeks — DBMS Tutorial", "https://www.geeksforgeeks.org/dbms/", { score: 80 }),
  r("r22-cse-2-2-database-management-systems", "important_questions", "website", "Normalization — 1NF, 2NF, 3NF, BCNF explained", "https://www.geeksforgeeks.org/introduction-of-database-normalization/", { unit_number: 3, score: 75 }),
  r("r22-cse-2-2-database-management-systems", "question_paper", "jntuh", "JNTUH Previous Question Papers Portal", "https://jntuh.ac.in/examinations", { score: 85, description: "Official examinations portal — search by subject code CS404PC." }),

  // ---- OS (R22 2-2)
  r("r22-cse-2-2-operating-systems", "video", "youtube", "Operating Systems — Neso Academy playlist", "https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O", { score: 88 }),
  r("r22-cse-2-2-operating-systems", "textbook", "website", "Operating System Concepts (Silberschatz) — companion site", "https://www.os-book.com/", { score: 80 }),

  // ---- CN (R22 3-1)
  r("r22-cse-3-1-computer-networks", "video", "youtube", "Computer Networks — Gate Smashers", "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_", { score: 90 }),
  r("r22-cse-3-1-computer-networks", "website", "website", "GeeksforGeeks — Computer Network Tutorials", "https://www.geeksforgeeks.org/computer-network-tutorials/", { score: 78 }),
  r("r22-cse-3-1-computer-networks", "textbook", "website", "Computer Networking: A Top-Down Approach — Kurose & Ross", "https://gaia.cs.umass.edu/kurose_ross/", { score: 82 }),

  // ---- DS (R22 2-1)
  r("r22-cse-2-1-data-structures", "video", "youtube", "Data Structures — Abdul Bari (Algorithms)", "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O", { score: 90 }),
  r("r22-cse-2-1-data-structures", "website", "website", "VisuAlgo — visualising data structures", "https://visualgo.net/en", { score: 85 }),
  r("r22-cse-2-1-data-structures", "lab", "github", "Data Structures Lab programs in C (community repo)", "https://github.com/topics/data-structures-lab", { score: 60 }),

  // ---- DAA (R22 3-1)
  r("r22-cse-3-1-design-and-analysis-of-algorithms", "video", "youtube", "Algorithms — Abdul Bari", "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O", { score: 92 }),
  r("r22-cse-3-1-design-and-analysis-of-algorithms", "textbook", "website", "CLRS — MIT OCW Introduction to Algorithms", "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", { score: 85 }),

  // ---- ML (R22 3-2)
  r("r22-cse-3-2-machine-learning", "video", "youtube", "Machine Learning — Andrew Ng (Stanford CS229)", "https://www.youtube.com/playlist?list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU", { score: 88 }),

  // ---- Compiler Design (R22 4-1)
  r("r22-cse-4-1-compiler-design", "video", "youtube", "Compiler Design — Gate Smashers", "https://www.youtube.com/playlist?list=PLxCzCOWd7aiEKtKSIHYusizkESC42diyc", { score: 85 }),

  // ---- R25 DBMS shares the same public resources
  r("r25-cse-2-1-data-base-management-systems", "video", "youtube", "DBMS Complete Course — Gate Smashers", "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y", { score: 90 }),
  r("r25-cse-2-2-computer-networks", "video", "youtube", "Computer Networks — Gate Smashers", "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_", { score: 90 }),
];
