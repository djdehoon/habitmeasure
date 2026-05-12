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
  const [utmData, setUtmData] = useState<{
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
  }>({
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
  });
  /** Avoid hydrating real <input>: some browser extensions inject attributes (e.g. __gcruniqueid) and break SSR/CSR match. */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only gate after SSR
    setMounted(true);

    const params = new URLSearchParams(window.location.search);
    setUtmData({
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
    });
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
        body: JSON.stringify({
          email: trimmed,
          utm_source: utmData.utm_source,
          utm_medium: utmData.utm_medium,
          utm_campaign: utmData.utm_campaign,
        }),
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
      className="container-shell section-wrap text-slate-100"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportIn}
    >
      <div className="glass-panel p-8 text-center md:p-10">
        <p className="heading-font text-sm font-bold uppercase tracking-[0.35em] text-emerald-400/90">
          EARLY ACCESS
        </p>
        <h2 className="mt-2 heading-font text-3xl font-black text-white md:text-5xl">
          Be the first to build better habits.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Join the waitlist. Get free access for 3 months when we launch, then cancel anytime — no credit card required.
        </p>

        {submitted && successMessage ? (
          <p className="mt-8 text-lg text-slate-300">{successMessage}</p>
        ) : !mounted ? (
          <div
            className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            aria-busy="true"
            aria-label="Loading waitlist form"
          >
            <div className="h-12 flex-1 rounded-full border border-white/10 bg-white/5" />
            <div className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 px-7 sm:w-auto">
              <span className="invisible font-bold text-slate-950">Get early access →</span>
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
                className="h-12 w-full rounded-full border border-white/10 bg-white/5 px-5 text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/40 disabled:opacity-60"
                required
              />
              {errorMessage ? (
                <p className="text-left text-sm text-red-400" role="alert">
                  {errorMessage}
                </p>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="h-12 shrink-0 rounded-xl bg-emerald-500 px-7 font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60 sm:w-auto"
            >
              {submitting ? "Joining..." : "Get early access →"}
            </button>
          </form>
        )}

      </div>
    </motion.section>
  );
}
