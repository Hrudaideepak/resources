/**
 * Auth: hall-ticket-as-username + password, sessions as signed JWTs (jose, HS256)
 * in an httpOnly cookie. Passwords are bcrypt-hashed (bcryptjs, cost 10).
 *
 * Env:
 *  JWT_SECRET          signing secret (min 32 chars). A dev-only fallback is used
 *                      when absent — never rely on it in production.
 *  ADMIN_HALL_TICKETS  comma-separated hall tickets that get the "admin" role at
 *                      signup/login (bootstrap: put your own hall ticket here).
 */
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "./types";

export const SESSION_COOKIE = "jntuh_session";
const SESSION_TTL = "7d";

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[auth] JWT_SECRET missing/short — using an insecure dev fallback. Set JWT_SECRET.");
    }
    // Zero-config dev default; NOT for production.
    return new TextEncoder().encode("jntuh-hub-insecure-dev-secret-change-me");
  }
  return new TextEncoder().encode(s);
}

/** JNTUH hall ticket numbers are 10-char alphanumeric, e.g. 22A81A0501. */
export const HALL_TICKET_RE = /^[0-9A-Z]{10}$/;

export function normalizeHallTicket(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isValidHallTicket(raw: string): boolean {
  return HALL_TICKET_RE.test(normalizeHallTicket(raw));
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Hall tickets that should receive the admin role (bootstrap via env). */
export function adminHallTickets(): Set<string> {
  return new Set(
    (process.env.ADMIN_HALL_TICKETS ?? "")
      .split(",")
      .map((s) => normalizeHallTicket(s))
      .filter(Boolean),
  );
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.hall_ticket)
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .setJti(crypto.randomUUID())
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const hall = payload.sub;
    const role = payload.role === "admin" ? "admin" : "student";
    if (!hall || !HALL_TICKET_RE.test(hall)) return null;
    return { hall_ticket: hall, name: String(payload.name ?? ""), role };
  } catch {
    return null;
  }
}

/** Server components/actions: current session from the cookie, or null. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await signSession(user);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 3600,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Cheap in-memory rate limiter for auth endpoints (best effort per instance). */
const attempts = new Map<string, number[]>();
export function authRateLimit(key: string, max = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const list = (attempts.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) return false;
  list.push(now);
  attempts.set(key, list);
  return true;
}
