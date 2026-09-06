"use server";

import { redirect } from "next/navigation";
import { authRateLimit, normalizeHallTicket, setSessionCookie } from "@/lib/auth";
import { authenticate } from "@/lib/users";

export async function loginAction(formData: FormData) {
  const hallTicket = String(formData.get("hall_ticket") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!authRateLimit(`login:${normalizeHallTicket(hallTicket)}`, 8)) {
    redirect(`/login?error=${encodeURIComponent("Too many attempts. Wait a minute and try again.")}`);
  }

  // Deliberately vague: never reveal whether the hall ticket or the password was wrong.
  const user = await authenticate(hallTicket, password);
  if (!user) redirect(`/login?error=${encodeURIComponent("Invalid hall ticket or password.")}`);

  await setSessionCookie(user);
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}
