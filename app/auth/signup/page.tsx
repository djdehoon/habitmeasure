"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/app/components/auth/PasswordField";
import { getBrowserUser, signUp } from "@/lib/supabase/auth";

const inputClassName =
  "w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/25";

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
          <h1 className="heading-font text-2xl font-bold tracking-tight text-slate-800">Sign up</h1>
          <p className="mt-1 text-sm text-slate-500">Maak je HabitMeasure account aan.</p>

          <form className="mt-6 max-h-[calc(100dvh-12rem)] space-y-4 overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible" onSubmit={handleSignup}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">First Name</span>
              <input
                type="text"
                required
                autoComplete="given-name"
                placeholder="First Name"
                maxLength={255}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Middle Name (optional)</span>
              <input
                type="text"
                autoComplete="additional-name"
                placeholder="Middle Name (optional)"
                maxLength={255}
                value={middleName}
                onChange={(event) => setMiddleName(event.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Last Name</span>
              <input
                type="text"
                placeholder="Last Name"
                required
                autoComplete="family-name"
                maxLength={255}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className={inputClassName}
              />
            </label>

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
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-sm disabled:pointer-events-none disabled:opacity-60"
            >
              {isSubmitting ? "Account maken..." : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Heb je al een account?{" "}
            <Link href="/auth/login" className="font-semibold text-[#5a7d72] underline-offset-2 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
