import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { loginAction } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  if (await getSession()) redirect("/");
  const { error, next = "/" } = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
        <p className="mt-1 text-sm text-stone-500">
          Your <strong>hall ticket number</strong> is your username. Logging in personalizes search, tracks your semester and unlocks the AI assistant.
        </p>
        {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <form action={loginAction} className="mt-5 space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="text-sm font-medium" htmlFor="hall_ticket">Hall ticket number</label>
            <input
              id="hall_ticket" name="hall_ticket" required maxLength={10} placeholder="22A81A0501" autoComplete="username"
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 font-mono uppercase tracking-wide focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password" required autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">
            Log in
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-500">
          New here?{" "}
          <Link href="/signup" className="font-medium text-indigo-600 hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
