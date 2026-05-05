"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, viewportIn } from "./motion";

const storageKey = "habitmeasure_waitlist";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    const current = localStorage.getItem(storageKey);
    const parsed = current ? (JSON.parse(current) as string[]) : [];
    localStorage.setItem(storageKey, JSON.stringify([...parsed, trimmed]));
    setSubmitted(true);
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
        <h2 className="heading-font text-3xl font-black md:text-5xl">Wees er als eerste bij</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-500">
          HabitMeasure lanceert binnenkort. Schrijf je in en ontvang early access + korting.
        </p>

        {submitted ? (
          <p className="mt-8 text-lg text-[#4B5D75]">
            Bedankt. Je staat op de lijst. We sturen je een bericht bij launch.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              className="h-12 flex-1 rounded-full border border-slate-300 bg-white/95 px-5 outline-none focus:border-[#8BA2B5]"
              required
            />
            <button type="submit" className="btn-primary h-12 px-7">
              Ik wil early access →
            </button>
          </form>
        )}

      </div>
    </motion.section>
  );
}
