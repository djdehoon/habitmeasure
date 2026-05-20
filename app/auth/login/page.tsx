"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserUser, requestPasswordReset } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "login" | "reset";

const inputClassName =
  "w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/25";

function recoveryErrorMessage(code: string | null): string | null {
  if (code === "recovery_link_invalid") {
    return "That reset link is invalid or has expired. Request a new link below.";
  }
  if (code === "recovery_session_expired") {
    return "Your reset session expired. Request a new link below.";
  }
  return null;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const urlError = useMemo(() => recoveryErrorMessage(searchParams.get("error")), [searchParams]);

  useEffect(() => {
    if (searchParams.get("forgot") === "1") {
      setMode("reset");
    }
  }, [searchParams]);

  useEffect(() => {
    if (urlError) {
      setMode("reset");
      setError(urlError);
    }
  }, [urlError]);

  useEffect(() => {
    void (async () => {
      const { user } = await getBrowserUser();
      if (!user) {
        return;
      }
      if (user.email) {
        setEmail(user.email);
      }
      if (mode === "login") {
        router.replace("/lab");
      }
    })();
  }, [router, mode]);

  const switchToLogin = () => {
    setMode("login");
    setError(null);
    setResetEmailSent(false);
    router.replace("/auth/login");
  };

  const switchToReset = () => {
    setMode("reset");
    setError(null);
    setResetEmailSent(false);
    setPassword("");
  };

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

  const handleSendResetLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResetEmailSent(false);
    setIsSubmitting(true);

    const result = await requestPasswordReset(email, window.location.origin);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setResetEmailSent(true);
  };

  return (
    <main className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="container-shell flex h-14 items-center justify-between sm:h-16">
          <Link href="/" className="flex items-center gap-2 heading-font text-sm font-bold text-slate-800 sm:text-base">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#8BA2B5]" aria-hidden />
            HabitMeasure
          </Link>
          <Link href="/" className="text-sm text-slate-500 transition hover:text-slate-800">
            Home
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-4 py-10 sm:py-12">
        <div className="w-full max-w-md rounded-[18px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[0_8px_24px_rgba(100,116,139,0.08)] sm:p-8">
          {mode === "login" ? (
            <>
              <h1 className="heading-font text-2xl font-bold tracking-tight text-slate-800">Login</h1>
              <p className="mt-1 text-sm text-slate-500">Welcome back to HabitMeasure.</p>

              <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClassName}
                  />
                </label>

                {error ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3 text-sm disabled:pointer-events-none disabled:opacity-60"
                >
                  {isSubmitting ? "Signing in…" : "Login"}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-slate-600">
                <button
                  type="button"
                  onClick={switchToReset}
                  className="font-semibold text-[#5a7d72] underline-offset-2 hover:underline"
                >
                  Forgot your password?
                </button>
              </p>

              <p className="mt-4 text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="font-semibold text-[#5a7d72] underline-offset-2 hover:underline">
                  Sign up
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="heading-font text-2xl font-bold tracking-tight text-slate-800">Forgot your password</h1>
              <p className="mt-1 text-sm text-slate-500">
                Enter your email and we will send you a link to set a new password.
              </p>

              {resetEmailSent ? (
                <div
                  className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
                  role="status"
                >
                  <p className="font-medium">Check your email</p>
                  <p className="mt-1">
                    If an account exists for this email, we sent a reset link. The link expires after a short time.
                  </p>
                  <button
                    type="button"
                    onClick={switchToLogin}
                    className="mt-3 font-semibold text-[#5a7d72] underline-offset-2 hover:underline"
                  >
                    Back to login
                  </button>
                </div>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={handleSendResetLink}>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className={inputClassName}
                    />
                  </label>

                  {error ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-3 text-sm disabled:pointer-events-none disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending…" : "Send reset link"}
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-slate-600">
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="font-semibold text-[#5a7d72] underline-offset-2 hover:underline"
                >
                  Back to login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function LoginPageFallback() {
  return (
    <main className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
