"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserUser } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { user } = await getBrowserUser();
      if (user) {
        router.replace("/lab");
      }
    })();
  }, [router]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    router.replace("/lab");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] p-4 text-white">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#141414] p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="mt-1 text-sm text-white/70">Welkom terug bij HabitMeasure.</p>

        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <label className="block">
            <span className="mb-1 block text-sm text-white/80">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-white/15 bg-[#1d1d1d] px-3 py-2 outline-none focus:border-[#00E5C0]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-white/80">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-white/15 bg-[#1d1d1d] px-3 py-2 outline-none focus:border-[#00E5C0]"
            />
          </label>

          {error ? <p className="rounded-md bg-[#E74C3C]/15 p-2 text-sm text-[#ffb5ad]">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-[#00E5C0] px-4 py-2 font-semibold text-black hover:bg-[#00d2b1] disabled:opacity-60"
          >
            {isSubmitting ? "Inloggen..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-white/75">
          Nog geen account?{" "}
          <Link href="/auth/signup" className="text-[#00E5C0] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
