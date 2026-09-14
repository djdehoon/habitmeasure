"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  authBrandLink,
  authCard,
  authError,
  authHeader,
  authHeaderInner,
  authInput,
  authLabel,
  authLabLink,
  authLink,
  authMuted,
  authNavLink,
  authPage,
  authPrimaryButton,
  authSubtitle,
  authSuccess,
  authTitle,
} from "@/app/components/auth/authUi";
import { getBrowserUser, requestPasswordReset } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "login" | "reset";

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
    <main className={authPage} style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className={authHeader}>
        <div className={authHeaderInner}>
          <Link href="/" className={authBrandLink}>
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#00E5C0]" aria-hidden />
            HabitMeasure
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className={authNavLink}>
              Home
            </Link>
            <Link href="/lab" className={authLabLink}>
              <span aria-hidden>🧪</span>
              <span>Lab</span>
              <span className="rounded-full bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-950">
                Beta
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-4 py-10 sm:py-12">
        <div className={authCard}>
          {mode === "login" ? (
            <>
              <h1 className={authTitle}>Login</h1>
              <p className={authSubtitle}>Welcome back to HabitMeasure.</p>

              <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                <label className="block">
                  <span className={authLabel}>Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={authInput}
                  />
                </label>

                <label className="block">
                  <span className={authLabel}>Password</span>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={authInput}
                  />
                </label>

                {error ? (
                  <p className={authError} role="alert">
                    {error}
                  </p>
                ) : null}

                <button type="submit" disabled={isSubmitting} className={authPrimaryButton}>
                  {isSubmitting ? "Signing in…" : "Login"}
                </button>
              </form>

              <p className={`mt-4 ${authMuted}`}>
                <button type="button" onClick={switchToReset} className={authLink}>
                  Forgot your password?
                </button>
              </p>

              <p className={`mt-4 ${authMuted}`}>
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className={authLink}>
                  Sign up
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className={authTitle}>Forgot your password</h1>
              <p className={authSubtitle}>
                Enter your email and we will send you a link to set a new password.
              </p>

              {resetEmailSent ? (
                <div className={`mt-6 ${authSuccess}`} role="status">
                  <p className="font-medium text-teal-50">Check your email</p>
                  <p className="mt-1 text-teal-100/90">
                    If an account exists for this email, we sent a reset link. The link expires after a short time.
                  </p>
                  <button type="button" onClick={switchToLogin} className={`mt-3 ${authLink}`}>
                    Back to login
                  </button>
                </div>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={handleSendResetLink}>
                  <label className="block">
                    <span className={authLabel}>Email</span>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className={authInput}
                    />
                  </label>

                  {error ? (
                    <p className={authError} role="alert">
                      {error}
                    </p>
                  ) : null}

                  <button type="submit" disabled={isSubmitting} className={authPrimaryButton}>
                    {isSubmitting ? "Sending…" : "Send reset link"}
                  </button>
                </form>
              )}

              <p className={`mt-6 ${authMuted}`}>
                <button type="button" onClick={switchToLogin} className={authLink}>
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
    <main className={authPage}>
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-slate-400">Loading…</p>
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
