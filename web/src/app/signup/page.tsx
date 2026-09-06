import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { signupAction } from "./actions";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getSession()) redirect("/");
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-stone-500">
          One account per student — your <strong>hall ticket number</strong> is the username. You&apos;ll fill in college,
          branch and semester on the next screen.
        </p>
        {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <form action={signupAction} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="hall_ticket">Hall ticket number</label>
            <input
              id="hall_ticket" name="hall_ticket" required maxLength={10} placeholder="22A81A0501" autoComplete="username"
              pattern="[0-9A-Za-z]{10}" title="10 characters, letters and digits only"
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 font-mono uppercase tracking-wide focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="name">Full name</label>
            <input
              id="name" name="name" required maxLength={80} placeholder="A. Student" autoComplete="name"
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password" required minLength={8} autoComplete="new-password"
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 focus:border-indigo-400 focus:outline-none"
            />
            <p className="mt-1 text-xs text-stone-400">Minimum 8 characters. Stored as a bcrypt hash — never in plain text.</p>
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password"
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">
            Sign up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-500">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
