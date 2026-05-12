"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/supabase/auth";

const inputClassName =
  "w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/25";

const inputWithIconPaddingClassName =
  "w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 pr-10 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/25";

export function BetaSignupForm({ inviteCode }: { inviteCode: string }) {
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

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(
      email.trim(),
      password,
      firstName.trim(),
      lastName.trim(),
      middleName.trim(),
      inviteCode,
    );

    if (result.error) {
      setIsSubmitting(false);
      setError(result.error);
      return;
    }

    setIsSubmitting(false);
    router.replace("/lab");
  };

  return (
    <div className="w-full max-w-md rounded-[18px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[0_8px_24px_rgba(100,116,139,0.08)] sm:p-8">
      <h1 className="heading-font text-2xl font-bold tracking-tight text-slate-800">Beta sign up</h1>
      <p className="mt-1 text-sm text-slate-500">Create your account with a valid invite to access the lab.</p>

      <form
        className="mt-6 max-h-[calc(100dvh-12rem)] space-y-4 overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible"
        onSubmit={handleSignup}
      >
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
            >
              {showPassword ? "Hide" : "Show"}
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
            >
              {showConfirmPassword ? "Hide" : "Show"}
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
          {isSubmitting ? "Creating account…" : "Create beta account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-[#5a7d72] underline-offset-2 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
