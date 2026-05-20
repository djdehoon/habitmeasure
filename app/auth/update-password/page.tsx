"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/app/components/auth/PasswordField";
import { getBrowserUser, updatePasswordAfterRecovery } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    void (async () => {
      const { user } = await getBrowserUser();
      if (!user) {
        router.replace("/auth/login?error=recovery_session_expired");
        return;
      }
      if (user.email) {
        setUserEmail(user.email);
      }
      setIsLoadingSession(false);
    })();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await updatePasswordAfterRecovery(newPassword);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();

    setSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
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
          {isLoadingSession ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : success ? (
            <>
              <h1 className="heading-font text-2xl font-bold tracking-tight text-slate-800">Password updated</h1>
              <div
                className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
                role="status"
              >
                <p className="font-medium">Your password has been set.</p>
                <p className="mt-1">Sign in with your new password.</p>
                <Link
                  href="/auth/login"
                  className="mt-3 inline-block font-semibold text-[#5a7d72] underline-offset-2 hover:underline"
                >
                  Go to login
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="heading-font text-2xl font-bold tracking-tight text-slate-800">Set a new password</h1>
              <p className="mt-1 text-sm text-slate-500">Choose a new password for your account.</p>

              <form className="relative mt-6 space-y-4" onSubmit={handleSubmit} autoComplete="on">
                {userEmail ? (
                  <label className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]">
                    <span className="absolute h-px w-px overflow-hidden whitespace-nowrap [clip:rect(0,0,0,0)]">
                      Account email
                    </span>
                    <input
                      type="email"
                      name="username"
                      autoComplete="username"
                      value={userEmail}
                      readOnly
                      className="h-px w-px border-0 p-0 opacity-0"
                    />
                  </label>
                ) : null}

                <PasswordField
                  id="new-password"
                  fieldRole="new"
                  label="New password"
                  value={newPassword}
                  onChange={setNewPassword}
                  show={showNewPassword}
                  onToggleShow={() => setShowNewPassword((prev) => !prev)}
                />

                <PasswordField
                  id="confirm-password"
                  fieldRole="confirm"
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirmPassword}
                  onToggleShow={() => setShowConfirmPassword((prev) => !prev)}
                />

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
                  {isSubmitting ? "Saving…" : "Set new password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
