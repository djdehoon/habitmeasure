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
              placeholder="Middle Name (optional)"
              maxLength={255}
              value={middleName}
              onChange={(event) => setMiddleName(event.target.value)}
              className="w-full rounded-md border border-white/15 bg-[#1d1d1d] px-3 py-2 outline-none focus:border-[#00E5C0]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-white/80">Last Name (optional)</span>
            <input
              type="text"
              placeholder="Last Name (optional)"
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
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-white/15 bg-[#1d1d1d] px-3 py-2 outline-none focus:border-[#00E5C0]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-white/80">Confirm Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-md border border-white/15 bg-[#1d1d1d] px-3 py-2 outline-none focus:border-[#00E5C0]"
            />
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
