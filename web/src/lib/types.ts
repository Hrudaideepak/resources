// Canonical academic model — mirrors supabase/migrations/0001_schema.sql
// University → College → Regulation → Program → Branch → Semester → Subject → Unit → Resource

export type CollegeType = "university" | "constituent" | "affiliated";

export interface College {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  type: CollegeType;
  is_autonomous: boolean;
  /** true ⇒ this college follows the university syllabus (regulations/subjects are the university's) */
  follows_university_syllabus: boolean;
  website: string | null;
}

export interface Regulation {
  id: string;
  slug: string; // "r22"
  name: string; // "R22"
  /** which college "owns" this regulation (university for JNTUH R22, or an autonomous college) */
  owner_college_id: string;
  applicable_from_year: number; // 2022
  source_url: string | null;
}

export interface Program {
  id: string;
  slug: string; // "btech"
  name: string; // "B.Tech"
  duration_years: number;
}

export interface Branch {
  id: string;
  slug: string; // "cse"
  code: string; // "CSE"
  name: string; // "Computer Science and Engineering"
  program_id: string;
}

export type SubjectKind = "theory" | "lab" | "project" | "mandatory" | "skill";

export interface Subject {
  id: string;
  slug: string; // "r22-cse-3-1-computer-networks"
  code: string | null; // "CS502PC"
  name: string; // "Computer Networks"
  short_name: string | null; // "CN"
  regulation_id: string;
  branch_id: string;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  kind: SubjectKind;
  credits: number | null;
  /** electives: "PE-I", "OE-II" … */
  elective_group: string | null;
  /** alternate names people search with */
  aliases: string[];
}

export interface Unit {
  id: string;
  subject_id: string;
  unit_number: number;
  title: string;
  topics: string | null;
}

export type ResourceType =
  | "notes"
  | "question_paper"
  | "syllabus"
  | "video"
  | "website"
  | "textbook"
  | "lab"
  | "important_questions";

export type ResourceSource =
  | "jntuh"
  | "college"
  | "youtube"
  | "website"
  | "github"
  | "telegram_public"
  | "user";

export type ResourceStatus = "pending" | "approved" | "rejected";

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  source: ResourceSource;
  subject_id: string;
  unit_number: number | null; // null ⇒ whole subject
  description: string | null;
  language: string; // "en" | "te" | "hi"
  status: ResourceStatus;
  /** simple ranking score 0-100 (later: relevance + syllabus match + votes + freshness) */
  score: number;
  submitted_by: string | null;
  created_at: string;
}

export interface Submission {
  url: string;
  title: string;
  type: ResourceType;
  subject_id: string;
  unit_number: number | null;
  description?: string;
  submitted_by?: string;
}

/** A subject enriched with its academic context — what most UI needs */
export interface SubjectWithContext extends Subject {
  regulation: Regulation;
  branch: Branch;
  resource_count: number;
}

export const RESOURCE_TYPE_LABEL: Record<ResourceType, { label: string; emoji: string }> = {
  notes: { label: "Notes", emoji: "📚" },
  question_paper: { label: "Previous Question Papers", emoji: "📄" },
  syllabus: { label: "Syllabus", emoji: "📊" },
  video: { label: "Video Lectures", emoji: "🎥" },
  website: { label: "Websites & Articles", emoji: "🌐" },
  textbook: { label: "Textbooks", emoji: "📖" },
  lab: { label: "Lab Programs", emoji: "💻" },
  important_questions: { label: "Important Questions", emoji: "📝" },
};

export const RESOURCE_TYPE_ORDER: ResourceType[] = [
  "syllabus",
  "notes",
  "important_questions",
  "question_paper",
  "video",
  "lab",
  "website",
  "textbook",
];
