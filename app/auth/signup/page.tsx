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
  authInput,
  authLabel,
  authLabLink,
  authLink,
  authMuted,
  authNavLink,
  authPage,
  authPrimaryButton,
  authSubtitle,
  authTitle,
} from "@/app/components/auth/authUi";
import { PasswordField } from "@/app/components/auth/PasswordField";
import { getBrowserUser, signUp } from "@/lib/supabase/auth";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { user } = await getBrowserUser();
      if (user) {
        router.replace("/");
      }
    })();
  }, [router]);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(email.trim(), password, firstName.trim(), lastName.trim(), middleName.trim());
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/");
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
          <h1 className={authTitle}>Sign up</h1>
          <p className={authSubtitle}>Maak je HabitMeasure account aan.</p>

          <form
            className="mt-6 max-h-[calc(100dvh-12rem)] space-y-4 overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible"
            onSubmit={handleSignup}
          >
            <label className="block">
              <span className={authLabel}>First Name</span>
              <input
                type="text"
                required
                autoComplete="given-name"
                placeholder="First Name"
                maxLength={255}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className={authInput}
              />
            </label>

            <label className="block">
              <span className={authLabel}>Middle Name (optional)</span>
              <input
                type="text"
                autoComplete="additional-name"
                placeholder="Middle Name (optional)"
                maxLength={255}
                value={middleName}
                onChange={(event) => setMiddleName(event.target.value)}
                className={authInput}
              />
            </label>

            <label className="block">
              <span className={authLabel}>Last Name</span>
              <input
                type="text"
                placeholder="Last Name"
                required
                autoComplete="family-name"
                maxLength={255}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className={authInput}
              />
            </label>

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

            <PasswordField
              id="password"
              fieldRole="new"
              label="Password"
              value={password}
              onChange={setPassword}
              show={showPassword}
              onToggleShow={() => setShowPassword((prev) => !prev)}
            />

            <PasswordField
              id="confirm-password"
              fieldRole="confirm"
              label="Confirm Password"
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
              {isSubmitting ? "Account maken..." : "Sign up"}
            </button>
          </form>

          <p className={`mt-6 ${authMuted}`}>
            Heb je al een account?{" "}
            <Link href="/auth/login" className={authLink}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
