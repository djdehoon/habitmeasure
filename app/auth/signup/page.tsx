"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserUser, signUp } from "@/lib/supabase/auth";

const inputClassName =
  "w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/25";

const inputWithIconPaddingClassName =
  "w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 pr-10 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/25";

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

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputWithIconPaddingClassName}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M2.1 3.51 1 4.62l3.17 3.17C2.69 9.12 1.57 10.75 1 12c1.73 3.8 5.53 6 11 6 2.19 0 4.12-.37 5.78-1.06L21.38 21l1.11-1.11L2.1 3.51ZM12 16c-2.88 0-5.13-1.28-6.43-4 .46-.94 1.25-1.98 2.47-2.83l1.55 1.55A3.99 3.99 0 0 0 12 16Zm0-8c2.88 0 5.13 1.28 6.43 4-.37.76-.96 1.6-1.82 2.33l1.43 1.43A11.77 11.77 0 0 0 23 12c-1.73-3.8-5.53-6-11-6-1.61 0-3.05.2-4.32.58l1.67 1.67C10.15 8.09 11.03 8 12 8Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M12 6C6.53 6 2.73 8.2 1 12c1.73 3.8 5.53 6 11 6s9.27-2.2 11-6c-1.73-3.8-5.53-6-11-6Zm0 10c-2.88 0-5.13-1.28-6.43-4C6.87 9.28 9.12 8 12 8s5.13 1.28 6.43 4c-1.3 2.72-3.55 4-6.43 4Zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</span>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={inputWithIconPaddingClassName}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                  title={showConfirmPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M2.1 3.51 1 4.62l3.17 3.17C2.69 9.12 1.57 10.75 1 12c1.73 3.8 5.53 6 11 6 2.19 0 4.12-.37 5.78-1.06L21.38 21l1.11-1.11L2.1 3.51ZM12 16c-2.88 0-5.13-1.28-6.43-4 .46-.94 1.25-1.98 2.47-2.83l1.55 1.55A3.99 3.99 0 0 0 12 16Zm0-8c2.88 0 5.13 1.28 6.43 4-.37.76-.96 1.6-1.82 2.33l1.43 1.43A11.77 11.77 0 0 0 23 12c-1.73-3.8-5.53-6-11-6-1.61 0-3.05.2-4.32.58l1.67 1.67C10.15 8.09 11.03 8 12 8Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M12 6C6.53 6 2.73 8.2 1 12c1.73 3.8 5.53 6 11 6s9.27-2.2 11-6c-1.73-3.8-5.53-6-11-6Zm0 10c-2.88 0-5.13-1.28-6.43-4C6.87 9.28 9.12 8 12 8s5.13 1.28 6.43 4c-1.3 2.72-3.55 4-6.43 4Zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                    </svg>
                  )}
                </button>
              </div>
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
