/**
 * User store. Local mode: hashed credentials in .data/users.json (zero-config
 * dev). Supabase mode: `users` table accessed via the service-role client only
 * (password hashes never go near the anon key).
 *
 * DATA_DIR env var overrides the local data directory (used by scripts/verify).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { adminHallTickets, hashPassword, isValidHallTicket, normalizeHallTicket, verifyPassword } from "./auth";
import { getSupabaseAdmin } from "./supabase";
import type { SessionUser, UserProfile } from "./types";

const DATA_DIR = () => process.env.DATA_DIR ?? path.join(process.cwd(), ".data");
const USERS_FILE = () => path.join(DATA_DIR(), "users.json");

type StoredUser = UserProfile & { password_hash: string };

async function readUsers(): Promise<StoredUser[]> {
  try {
    return JSON.parse(await fs.readFile(USERS_FILE(), "utf8"));
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await fs.mkdir(DATA_DIR(), { recursive: true });
  await fs.writeFile(USERS_FILE(), JSON.stringify(users, null, 2));
}

const toProfile = (u: StoredUser): UserProfile => {
  const { password_hash: _ignored, ...profile } = u;
  return profile;
};

const publicUser = (u: StoredUser): SessionUser | null => {
  if (!u?.hall_ticket) return null;
  // env-listed admins always get the admin role, even if the row says student
  const role = adminHallTickets().has(u.hall_ticket) ? "admin" : u.role;
  return { hall_ticket: u.hall_ticket, name: u.name, role };
};

// ------------------------------------------------------------------- lookups
async function fetchStored(hallTicket: string): Promise<StoredUser | null> {
  if (getSupabaseAdmin()) {
    const { data, error } = await getSupabaseAdmin()!
      .from("users")
      .select("*")
      .eq("hall_ticket", hallTicket)
      .maybeSingle();
    if (error) throw new Error(`users lookup failed: ${error.message}`);
    return (data as StoredUser) ?? null;
  }
  return (await readUsers()).find((u) => u.hall_ticket === hallTicket) ?? null;
}

export async function getUserByHallTicket(hallTicket: string): Promise<UserProfile | null> {
  const u = await fetchStored(normalizeHallTicket(hallTicket));
  return u ? toProfile(u) : null;
}

// ------------------------------------------------------------------ register
export async function registerUser(
  hallTicketRaw: string,
  name: string,
  password: string,
): Promise<{ ok: true; session: SessionUser } | { ok: false; error: string }> {
  const hall_ticket = normalizeHallTicket(hallTicketRaw);
  const cleanName = name.trim().slice(0, 80);
  if (!isValidHallTicket(hall_ticket)) return { ok: false, error: "Hall ticket must be 10 letters/digits, e.g. 22A81A0501." };
  if (cleanName.length < 2) return { ok: false, error: "Please enter your name." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (await fetchStored(hall_ticket)) return { ok: false, error: "This hall ticket is already registered. Try logging in." };

  const now = new Date().toISOString();
  const user: StoredUser = {
    hall_ticket,
    name: cleanName,
    password_hash: await hashPassword(password),
    college: null,
    branch_id: null,
    regulation_id: null,
    year: null,
    semester: null,
    role: adminHallTickets().has(hall_ticket) ? "admin" : "student",
    created_at: now,
    updated_at: now,
  };

  if (getSupabaseAdmin()) {
    const { error } = await getSupabaseAdmin()!.from("users").insert(user);
    if (error) return { ok: false, error: error.code === "23505" ? "This hall ticket is already registered." : error.message };
  } else {
    const users = await readUsers();
    users.push(user);
    await writeUsers(users);
  }
  return { ok: true, session: publicUser(user)! };
}

// --------------------------------------------------------------------- login
export async function authenticate(hallTicketRaw: string, password: string): Promise<SessionUser | null> {
  const hall_ticket = normalizeHallTicket(hallTicketRaw);
  if (!isValidHallTicket(hall_ticket)) return null;
  const user = await fetchStored(hall_ticket);
  if (!user) return null;
  const ok = await verifyPassword(password, user.password_hash).catch(() => false);
  return ok ? publicUser(user) : null;
}

// -------------------------------------------------------------------- update
export type ProfilePatch = Partial<Pick<UserProfile, "name" | "college" | "branch_id" | "regulation_id" | "year" | "semester">>;

export async function updateProfile(hallTicket: string, patch: ProfilePatch): Promise<{ ok: true } | { ok: false; error: string }> {
  const current = await fetchStored(normalizeHallTicket(hallTicket));
  if (!current) return { ok: false, error: "User not found." };
  const next: StoredUser = { ...current, ...patch, updated_at: new Date().toISOString() };

  if (getSupabaseAdmin()) {
    const { error } = await getSupabaseAdmin()!
      .from("users")
      .update({
        name: next.name,
        college: next.college,
        branch_id: next.branch_id,
        regulation_id: next.regulation_id,
        year: next.year,
        semester: next.semester,
        updated_at: next.updated_at,
      })
      .eq("hall_ticket", next.hall_ticket);
    if (error) return { ok: false, error: error.message };
  } else {
    const users = await readUsers();
    const i = users.findIndex((u) => u.hall_ticket === next.hall_ticket);
    if (i === -1) return { ok: false, error: "User not found." };
    users[i] = next;
    await writeUsers(users);
  }
  return { ok: true };
}

/** A profile is complete enough for personalization when these are set. */
export type CompleteProfile = UserProfile & {
  college: string;
  branch_id: string;
  regulation_id: string;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
};
export function isProfileComplete(p: UserProfile | null | undefined): p is CompleteProfile {
  return !!(p && p.branch_id && p.regulation_id && p.year && p.semester && p.college);
}
