/**
 * Canonical academic seed data — JNTUH B.Tech CSE, R22 + R25.
 *
 * Source of truth:
 *  R22: https://jntuh.ac.in/uploads/academics/R22B.Tech.CSECourseStructureSyllabus.pdf
 *  R25: https://jntuh.ac.in/uploads/academics/R25B.TECH.CSECourseStructure.pdf
 *
 * This file is (a) the offline/local data source used when Supabase env vars
 * are missing and (b) the input for `npm run seed:sql`, which emits
 * supabase/seed.sql.  IDs are deterministic slugs so seeds are idempotent.
 */
import type { Branch, College, Program, Regulation, Subject, SubjectKind } from "@/lib/types";

export const colleges: College[] = [
  {
    id: "jntuh",
    slug: "jntuh",
    name: "Jawaharlal Nehru Technological University Hyderabad",
    short_name: "JNTUH",
    type: "university",
    is_autonomous: true,
    follows_university_syllabus: true,
    website: "https://jntuh.ac.in",
  },
];

export const regulations: Regulation[] = [
  {
    id: "jntuh-r22",
    slug: "r22",
    name: "R22",
    owner_college_id: "jntuh",
    applicable_from_year: 2022,
    source_url: "https://jntuh.ac.in/uploads/academics/R22B.Tech.CSECourseStructureSyllabus.pdf",
  },
  {
    id: "jntuh-r25",
    slug: "r25",
    name: "R25",
    owner_college_id: "jntuh",
    applicable_from_year: 2025,
    source_url: "https://jntuh.ac.in/uploads/academics/R25B.TECH.CSECourseStructure.pdf",
  },
];

export const programs: Program[] = [{ id: "btech", slug: "btech", name: "B.Tech", duration_years: 4 }];

export const branches: Branch[] = [
  { id: "btech-cse", slug: "cse", code: "CSE", name: "Computer Science and Engineering", program_id: "btech" },
];

// ---------------------------------------------------------------- helpers
type Row = [
  code: string | null,
  name: string,
  credits: number | null,
  kind?: SubjectKind,
  extra?: { short?: string; aliases?: string[]; elective?: string },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sem(regId: string, branchId: string, year: 1 | 2 | 3 | 4, semester: 1 | 2, rows: Row[]): Subject[] {
  const reg = regulations.find((r) => r.id === regId)!;
  const br = branches.find((b) => b.id === branchId)!;
  return rows.map(([code, name, credits, kind = "theory", extra = {}]) => ({
    id: `${reg.slug}-${br.slug}-${year}-${semester}-${slugify(name)}`,
    slug: `${reg.slug}-${br.slug}-${year}-${semester}-${slugify(name)}`,
    code,
    name,
    short_name: extra.short ?? null,
    regulation_id: regId,
    branch_id: branchId,
    year,
    semester,
    kind,
    credits,
    elective_group: extra.elective ?? null,
    aliases: extra.aliases ?? [],
  }));
}

// ------------------------------------------------------------- R22 CSE
const r22: Subject[] = [
  ...sem("jntuh-r22", "btech-cse", 1, 1, [
    ["MA101BS", "Matrices and Calculus", 4, "theory", { short: "M&C", aliases: ["M1", "Maths 1"] }],
    ["CH102BS", "Engineering Chemistry", 4, "theory", { short: "EC" }],
    ["CS103ES", "Programming for Problem Solving", 3, "theory", { short: "PPS", aliases: ["C Programming"] }],
    ["EE104ES", "Basic Electrical Engineering", 2, "theory", { short: "BEE" }],
    ["ME105ES", "Computer Aided Engineering Graphics", 3, "theory", { short: "CAEG", aliases: ["Engineering Graphics"] }],
    ["CS106ES", "Elements of Computer Science & Engineering", 1, "theory", { short: "ECSE" }],
    ["CH107BS", "Engineering Chemistry Laboratory", 1, "lab"],
    ["CS108ES", "Programming for Problem Solving Laboratory", 1, "lab", { short: "PPS Lab" }],
    ["EE109ES", "Basic Electrical Engineering Laboratory", 1, "lab", { short: "BEE Lab" }],
  ]),
  ...sem("jntuh-r22", "btech-cse", 1, 2, [
    ["MA201BS", "Ordinary Differential Equations and Vector Calculus", 4, "theory", { short: "ODE&VC", aliases: ["M2", "Maths 2"] }],
    ["PH202BS", "Applied Physics", 4, "theory", { short: "AP" }],
    ["ME203ES", "Engineering Workshop", 2.5, "lab"],
    ["EN204HS", "English for Skill Enhancement", 2, "theory", { short: "ESE" }],
    ["EC205ES", "Electronic Devices and Circuits", 2, "theory", { short: "EDC" }],
    ["CS206ES", "Python Programming Laboratory", 2, "lab", { short: "Python Lab" }],
    ["PH207BS", "Applied Physics Laboratory", 1.5, "lab"],
    ["EN208HS", "English Language and Communication Skills Laboratory", 1, "lab", { short: "ELCS Lab" }],
    ["CS209ES", "IT Workshop", 1, "lab"],
    ["MC210", "Environmental Science", 0, "mandatory", { short: "ES" }],
  ]),
  ...sem("jntuh-r22", "btech-cse", 2, 1, [
    ["CS301PC", "Digital Electronics", 3, "theory", { short: "DE", aliases: ["Digital Logic Design", "DLD"] }],
    ["CS302PC", "Data Structures", 3, "theory", { short: "DS" }],
    ["CS303PC", "Computer Oriented Statistical Methods", 4, "theory", { short: "COSM", aliases: ["P&S", "Probability and Statistics"] }],
    ["CS304PC", "Computer Organization and Architecture", 3, "theory", { short: "COA" }],
    ["CS305PC", "Object Oriented Programming through Java", 3, "theory", { short: "OOPJ", aliases: ["Java"] }],
    ["CS306PC", "Data Structures Lab", 1.5, "lab"],
    ["CS307PC", "Object Oriented Programming through Java Lab", 1.5, "lab", { short: "Java Lab" }],
    ["CS308PC", "Data Visualization - R Programming / Power BI", 1, "skill"],
    ["MC309", "Gender Sensitization Lab", 0, "mandatory"],
  ]),
  ...sem("jntuh-r22", "btech-cse", 2, 2, [
    ["CS401PC", "Discrete Mathematics", 3, "theory", { short: "DM", aliases: ["MFCS"] }],
    ["SM402MS", "Business Economics & Financial Analysis", 3, "theory", { short: "BEFA" }],
    ["CS403PC", "Operating Systems", 3, "theory", { short: "OS" }],
    ["CS404PC", "Database Management Systems", 3, "theory", { short: "DBMS" }],
    ["CS405PC", "Software Engineering", 3, "theory", { short: "SE" }],
    ["CS406PC", "Operating Systems Lab", 1, "lab", { short: "OS Lab" }],
    ["CS407PC", "Database Management Systems Lab", 1, "lab", { short: "DBMS Lab" }],
    ["CS408PC", "Real-time Research Project / Societal Related Project", 2, "project", { short: "RTRP" }],
    ["CS409PC", "Node JS / React JS / Django", 1, "skill"],
    ["MC410", "Constitution of India", 0, "mandatory", { short: "COI" }],
  ]),
  ...sem("jntuh-r22", "btech-cse", 3, 1, [
    ["CS501PC", "Design and Analysis of Algorithms", 4, "theory", { short: "DAA" }],
    ["CS502PC", "Computer Networks", 3, "theory", { short: "CN" }],
    ["CS503PC", "DevOps", 3, "theory"],
    [null, "Professional Elective - I", 3, "theory", { elective: "PE-I", aliases: ["Quantum Computing", "Advanced Computer Architecture", "Data Analytics", "Image Processing", "Principles of Programming Languages"] }],
    [null, "Professional Elective - II", 3, "theory", { elective: "PE-II", aliases: ["Computer Graphics", "Embedded Systems", "Information Retrieval Systems", "Distributed Databases", "Natural Language Processing"] }],
    ["CS504PC", "Computer Networks Lab", 1, "lab", { short: "CN Lab" }],
    ["CS505PC", "DevOps Lab", 1, "lab"],
    ["EN508HS", "Advanced English Communication Skills Lab", 1, "lab", { short: "AECS Lab" }],
    ["CS506PC", "UI Design - Flutter", 1, "skill"],
    ["MC510", "Intellectual Property Rights", 0, "mandatory", { short: "IPR" }],
  ]),
  ...sem("jntuh-r22", "btech-cse", 3, 2, [
    ["CS601PC", "Machine Learning", 3, "theory", { short: "ML" }],
    ["CS602PC", "Formal Languages and Automata Theory", 3, "theory", { short: "FLAT", aliases: ["Automata", "TOC"] }],
    ["CS603PC", "Artificial Intelligence", 3, "theory", { short: "AI" }],
    [null, "Professional Elective - III", 3, "theory", { elective: "PE-III", aliases: ["Full Stack Development", "Internet of Things", "Scripting Languages", "Mobile Application Development", "Software Testing Methodologies"] }],
    [null, "Open Elective - I", 3, "theory", { elective: "OE-I" }],
    ["CS604PC", "Machine Learning Lab", 1, "lab", { short: "ML Lab" }],
    ["CS605PC", "Artificial Intelligence Laboratory", 1, "lab", { short: "AI Lab" }],
    [null, "Professional Elective - III Lab", 1, "lab", { elective: "PE-III" }],
    ["CS606PC", "Industrial Oriented Mini Project / Internship / Skill Development Course (Big Data - Spark)", 2, "project"],
    ["MC609", "Environmental Science", 0, "mandatory"],
  ]),
  ...sem("jntuh-r22", "btech-cse", 4, 1, [
    ["CS701PC", "Cryptography and Network Security", 3, "theory", { short: "CNS" }],
    ["CS702PC", "Compiler Design", 3, "theory", { short: "CD" }],
    [null, "Professional Elective - IV", 3, "theory", { elective: "PE-IV", aliases: ["Graph Theory", "Cyber Security", "Soft Computing", "Cloud Computing", "Ad hoc & Sensor Networks"] }],
    [null, "Professional Elective - V", 3, "theory", { elective: "PE-V", aliases: ["Advanced Algorithms", "Agile Methodology", "Robotic Process Automation", "Blockchain Technology", "Software Process & Project Management"] }],
    [null, "Open Elective - II", 3, "theory", { elective: "OE-II" }],
    ["CS703PC", "Cryptography and Network Security Lab", 1, "lab", { short: "CNS Lab" }],
    ["CS704PC", "Compiler Design Lab", 1, "lab", { short: "CD Lab" }],
    ["CS705PC", "Project Stage - I", 3, "project"],
  ]),
  ...sem("jntuh-r22", "btech-cse", 4, 2, [
    ["CS801PC", "Organizational Behavior", 3, "theory", { short: "OB" }],
    [null, "Professional Elective - VI", 3, "theory", { elective: "PE-VI", aliases: ["Computational Complexity", "Distributed Systems", "Deep Learning", "Human Computer Interaction", "Cyber Forensics"] }],
    [null, "Open Elective - III", 3, "theory", { elective: "OE-III" }],
    [null, "Project Stage - II including Seminar", 11, "project"],
  ]),
];

// ------------------------------------------------------------- R25 CSE
// R25 course codes are not published in the course-structure PDF yet → null.
const r25: Subject[] = [
  ...sem("jntuh-r25", "btech-cse", 1, 1, [
    [null, "Matrices and Calculus", 4, "theory", { short: "M&C", aliases: ["M1"] }],
    [null, "Engineering Chemistry", 3, "theory", { short: "EC" }],
    [null, "English for Skill Enhancement", 3, "theory", { short: "ESE" }],
    [null, "Electronic Devices and Circuits", 3, "theory", { short: "EDC" }],
    [null, "Programming for Problem Solving", 3, "theory", { short: "PPS", aliases: ["C Programming"] }],
    [null, "Engineering Chemistry Lab", 1, "lab"],
    [null, "Programming for Problem Solving Lab", 1, "lab", { short: "PPS Lab" }],
    [null, "English Language and Communication Skills Lab", 1, "lab", { short: "ELCS Lab" }],
    [null, "Engineering Workshop", 1, "lab"],
  ]),
  ...sem("jntuh-r25", "btech-cse", 1, 2, [
    [null, "Ordinary Differential Equations and Vector Calculus", 3, "theory", { short: "ODE&VC", aliases: ["M2"] }],
    [null, "Advanced Engineering Physics", 3, "theory", { short: "AEP" }],
    [null, "Computer Aided Engineering Graphics", 3, "theory", { short: "CAEG" }],
    [null, "Basic Electrical Engineering", 3, "theory", { short: "BEE" }],
    [null, "Data Structures", 3, "theory", { short: "DS" }],
    [null, "Advanced Engineering Physics Lab", 1, "lab"],
    [null, "Data Structures Lab", 1, "lab", { short: "DS Lab" }],
    [null, "Python Programming Lab", 1, "lab"],
    [null, "Basic Electrical Engineering Lab", 1, "lab", { short: "BEE Lab" }],
    [null, "IT Workshop", 1, "lab"],
  ]),
  ...sem("jntuh-r25", "btech-cse", 2, 1, [
    [null, "Discrete Mathematics", 3, "theory", { short: "DM" }],
    [null, "Computer Organization and Architecture", 3, "theory", { short: "COA" }],
    [null, "Object Oriented Programming through Java", 3, "theory", { short: "OOPJ", aliases: ["Java"] }],
    [null, "Software Engineering", 3, "theory", { short: "SE" }],
    [null, "Data Base Management Systems", 3, "theory", { short: "DBMS", aliases: ["Database Management Systems"] }],
    [null, "Innovation and Entrepreneurship", 2, "theory", { short: "I&E" }],
    [null, "Object Oriented Programming through Java Lab", 1, "lab", { short: "Java Lab" }],
    [null, "Software Engineering Lab", 1, "lab", { short: "SE Lab" }],
    [null, "Data Base Management Systems Lab", 1, "lab", { short: "DBMS Lab" }],
    [null, "Skill Development Course - 1 (Node JS / React JS / Django)", 1, "skill", { short: "SDC-1" }],
    [null, "Environmental Science", 1, "mandatory", { short: "ES" }],
  ]),
  ...sem("jntuh-r25", "btech-cse", 2, 2, [
    [null, "Computer Oriented Statistical Methods", 3, "theory", { short: "COSM" }],
    [null, "Operating Systems", 3, "theory", { short: "OS" }],
    [null, "Algorithm Design and Analysis", 3, "theory", { short: "ADA", aliases: ["DAA", "Design and Analysis of Algorithms"] }],
    [null, "Computer Networks", 3, "theory", { short: "CN" }],
    [null, "Machine Learning", 3, "theory", { short: "ML" }],
    [null, "Computational Mathematics Lab", 1, "lab"],
    [null, "Operating Systems Lab", 1, "lab", { short: "OS Lab" }],
    [null, "Computer Networks Lab", 1, "lab", { short: "CN Lab" }],
    [null, "Machine Learning Lab", 1, "lab", { short: "ML Lab" }],
    [null, "Skill Development Course - 2 (Data Visualization - R / Python / Power BI)", 1, "skill", { short: "SDC-2" }],
  ]),
  ...sem("jntuh-r25", "btech-cse", 3, 1, [
    [null, "Automata Theory and Compiler Design", 3, "theory", { short: "ATCD", aliases: ["FLAT", "Compiler Design"] }],
    [null, "Artificial Intelligence", 3, "theory", { short: "AI" }],
    [null, "DevOps", 3, "theory"],
    [null, "Professional Elective - I", 3, "theory", { elective: "PE-I", aliases: ["Computer Graphics", "Introduction to Data Science", "Software Testing Methodologies", "Data Mining", "Web Programming", "Distributed Systems"] }],
    [null, "Open Elective - I", 2, "theory", { elective: "OE-I" }],
    [null, "Compiler Design Lab", 1, "lab", { short: "CD Lab" }],
    [null, "Artificial Intelligence with Python Lab", 1, "lab", { short: "AI Lab" }],
    [null, "DevOps Lab", 1, "lab"],
    [null, "Field-Based Project / Internship", 2, "project"],
    [null, "Skill Development Course - 3 (UI Design - Flutter / Android Studio)", 1, "skill", { short: "SDC-3" }],
    [null, "Indian Knowledge System", 1, "mandatory", { short: "IKS" }],
  ]),
  ...sem("jntuh-r25", "btech-cse", 3, 2, [
    [null, "Cryptography and Network Security", 3, "theory", { short: "CNS" }],
    [null, "Deep Learning", 3, "theory", { short: "DL" }],
    [null, "Business Economics and Financial Analysis", 3, "theory", { short: "BEFA" }],
    [null, "Professional Elective - II", 3, "theory", { elective: "PE-II", aliases: ["Image Processing", "Blockchain Technology", "Software Project Management", "Mining Massive Datasets", "Full Stack Development", "Generative AI"] }],
    [null, "Open Elective - II", 2, "theory", { elective: "OE-II" }],
    [null, "Cryptography and Network Security Lab", 1, "lab", { short: "CNS Lab" }],
    [null, "Deep Learning Lab", 1, "lab", { short: "DL Lab" }],
    [null, "Advanced Data Structures using Python Lab", 1, "lab"],
    [null, "Advanced English Communication Skills Laboratory", 1, "lab", { short: "AECS Lab" }],
    [null, "Skill Development Course - 4 (Prompt Engineering)", 1, "skill", { short: "SDC-4" }],
    [null, "Gender Sensitization Lab / Human Values and Professional Ethics", 1, "mandatory"],
  ]),
  ...sem("jntuh-r25", "btech-cse", 4, 1, [
    [null, "Natural Language Processing", 3, "theory", { short: "NLP" }],
    [null, "Cyber Security", 3, "theory", { short: "CS" }],
    [null, "Fundamentals of Management", 3, "theory", { short: "FM" }],
    [null, "Professional Elective - III", 3, "theory", { elective: "PE-III", aliases: ["Computer Vision", "Scripting Languages", "Vulnerability and Penetration Testing", "Data Stream Mining", "Cloud Computing", "Information Retrieval Systems"] }],
    [null, "Professional Elective - IV", 3, "theory", { elective: "PE-IV", aliases: ["Augmented Reality & Virtual Reality", "Agile Methodology", "Big Data Technologies", "Quantum Computing", "Robotic Process Automation", "Cyber Forensics"] }],
    [null, "Open Elective - III", 2, "theory", { elective: "OE-III" }],
    [null, "Natural Language Processing Lab", 1, "lab", { short: "NLP Lab" }],
    [null, "Cyber Security Lab", 1, "lab"],
    [null, "Industry Oriented Mini Project / Summer Internship", 2, "project"],
  ]),
  ...sem("jntuh-r25", "btech-cse", 4, 2, [
    [null, "Professional Elective - V", 3, "theory", { elective: "PE-V", aliases: ["Social Media Mining", "Nature Inspired Computing", "Internet of Things", "Game Theory", "Mobile Application Development", "Human Computer Interaction"] }],
    [null, "Professional Elective - VI", 3, "theory", { elective: "PE-VI", aliases: ["High Performance Computing", "Edge Computing", "Graph Theory", "UI/UX Design", "Sustainable Engineering", "Distributed Databases"] }],
    [null, "Project Work", 14, "project"],
  ]),
];

export const subjects: Subject[] = [...r22, ...r25];
