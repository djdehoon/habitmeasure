"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authBrandLink,
  authCard,
  authError,
  authHeader,
  authHeaderInner,
  authLink,
  authNavLink,
  authPage,
  authPrimaryButton,
  authSubtitle,
  authSuccess,
  authTitle,
} from "@/app/components/auth/authUi";
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
    <main className={authPage} style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className={authHeader}>
        <div className={authHeaderInner}>
          <Link href="/" className={authBrandLink}>
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#00E5C0]" aria-hidden />
            HabitMeasure
          </Link>
          <Link href="/" className={authNavLink}>
            Home
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-4 py-10 sm:py-12">
        <div className={authCard}>
          {isLoadingSession ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : success ? (
            <>
              <h1 className={authTitle}>Password updated</h1>
              <div className={`mt-6 ${authSuccess}`} role="status">
                <p className="font-medium text-teal-50">Your password has been set.</p>
                <p className="mt-1 text-teal-100/90">Sign in with your new password.</p>
                <Link href="/auth/login" className={`mt-3 inline-block ${authLink}`}>
                  Go to login
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className={authTitle}>Set a new password</h1>
              <p className={authSubtitle}>Choose a new password for your account.</p>

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
                  <p className={authError} role="alert">
                    {error}
                  </p>
                ) : null}

                <button type="submit" disabled={isSubmitting} className={authPrimaryButton}>
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
