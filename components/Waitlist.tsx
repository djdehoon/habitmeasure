"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, viewportIn } from "./motion";

function isWaitlistResponse(
  value: unknown,
): value is { success: boolean; message: string } {
  if (typeof value !== "object" || value === null) return false;
  if (!("success" in value) || !("message" in value)) return false;
  return (
    typeof value.success === "boolean" && typeof value.message === "string"
  );
}

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /** Avoid hydrating real <input>: some browser extensions inject attributes (e.g. __gcruniqueid) and break SSR/CSR match. */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only gate after SSR
    setMounted(true);
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      let payload: unknown;
      try {
        payload = await res.json();
      } catch {
        setErrorMessage("Please try again later.");
        setSubmitting(false);
        return;
      }

      if (!isWaitlistResponse(payload)) {
        setErrorMessage("Please try again later.");
        setSubmitting(false);
        return;
      }

      if (payload.success) {
        setSuccessMessage(payload.message);
        setSubmitted(true);
      } else {
        setErrorMessage(payload.message);
      }
    } catch {
      setErrorMessage("Please try again later.");
    }

    setSubmitting(false);
  };

  return (
    <motion.section
      id="waitlist"
      className="container-shell section-wrap"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportIn}
    >
      <div className="rounded-3xl border border-[#A7BFD2]/35 bg-gradient-to-r from-[#A7BFD2]/16 to-[#B8BFD8]/14 p-8 text-center">
        <p className="heading-font text-sm font-bold uppercase tracking-[0.35em] text-slate-500">
          EARLY ACCESS
        </p>
        <h2 className="mt-2 heading-font text-3xl font-black md:text-5xl">
          Be the first to build better habits.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-500">
          Join the waitlist and get early access when we launch. Free forever for early members.
        </p>

        {submitted && successMessage ? (
          <p className="mt-8 text-lg text-[#4B5D75]">{successMessage}</p>
        ) : !mounted ? (
          <div
            className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            aria-busy="true"
            aria-label="Loading waitlist form"
          >
            <div className="h-12 flex-1 rounded-full border border-slate-300 bg-white/95" />
            <div className="btn-primary flex h-12 shrink-0 items-center justify-center px-7 sm:w-auto">
              <span className="invisible">Get early access →</span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={submitting}
                className="h-12 w-full rounded-full border border-slate-300 bg-white/95 px-5 outline-none focus:border-[#8BA2B5] disabled:opacity-60"
                required
              />
              {errorMessage ? (
                <p className="text-left text-sm text-red-600" role="alert">
                  {errorMessage}
                </p>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary h-12 shrink-0 px-7 disabled:opacity-60 sm:w-auto"
            >
              {submitting ? "Joining..." : "Get early access →"}
            </button>
          </form>
        )}

      </div>
    </motion.section>
  );
}
