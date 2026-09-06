"use server";

import { redirect } from "next/navigation";
import { authRateLimit, normalizeHallTicket, setSessionCookie } from "@/lib/auth";
import { registerUser } from "@/lib/users";

export async function signupAction(formData: FormData) {
  const hallTicket = String(formData.get("hall_ticket") ?? "");
  const name = String(formData.get("name") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const fail = (msg: string): never => redirect(`/signup?error=${encodeURIComponent(msg)}`);

  if (!authRateLimit(`signup:${normalizeHallTicket(hallTicket)}`, 8)) return fail("Too many attempts. Wait a minute and try again.");
  if (password !== confirm) return fail("Passwords do not match.");

  const res = await registerUser(hallTicket, name, password);
  if (!res.ok) return fail(res.error);

  await setSessionCookie(res.session);
  redirect("/profile?welcome=1");
}
