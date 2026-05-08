"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
        router.replace("/lab");
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

    router.push("/lab");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] p-4 text-white">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#141414] p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Sign up</h1>
        <p className="mt-1 text-sm text-white/70">Maak je HabitMeasure account aan.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSignup}>
          <label className="block">
            <span className="mb-1 block text-sm text-white/80">First Name</span>
            <input
              type="text"
              required
              autoComplete="given-name"
              placeholder="First Name"
              maxLength={255}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="w-full rounded-md border border-white/15 bg-[#1d1d1d] px-3 py-2 outline-none focus:border-[#00E5C0]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-white/80">Middle Name (optional)</span>
            <input
              type="text"
              autoComplete="additional-name"
              placeholder="Middle Name (optional)"
              maxLength={255}
              value={middleName}
              onChange={(event) => setMiddleName(event.target.value)}
              className="w-full rounded-md border border-white/15 bg-[#1d1d1d] px-3 py-2 outline-none focus:border-[#00E5C0]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-white/80">Last Name</span>
            <input
              type="text"
              placeholder="Last Name"
              required
              autoComplete="family-name"
              maxLength={255}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="w-full rounded-md border border-white/15 bg-[#1d1d1d] px-3 py-2 outline-none focus:border-[#00E5C0]"
            />
          </label>

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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border border-white/15 bg-[#1d1d1d] px-3 py-2 pr-10 outline-none focus:border-[#00E5C0]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/75 hover:bg-white/10 hover:text-white"
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
            <span className="mb-1 block text-sm text-white/80">Confirm Password</span>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-md border border-white/15 bg-[#1d1d1d] px-3 py-2 pr-10 outline-none focus:border-[#00E5C0]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/75 hover:bg-white/10 hover:text-white"
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

          {error ? <p className="rounded-md bg-[#E74C3C]/15 p-2 text-sm text-[#ffb5ad]">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-[#00E5C0] px-4 py-2 font-semibold text-black hover:bg-[#00d2b1] disabled:opacity-60"
          >
            {isSubmitting ? "Account maken..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-sm text-white/75">
          Heb je al een account?{" "}
          <Link href="/auth/login" className="text-[#00E5C0] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
