"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportIn } from "./motion";

export function Pricing() {
  return (
    <section id="prijzen" className="container-shell section-wrap flex flex-col items-center text-center text-slate-100">
      <motion.h2
        className="heading-font text-3xl font-black text-white md:text-5xl"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        Fair pricing. Always.
      </motion.h2>

      <motion.div
        className="mt-10 grid w-full max-w-5xl gap-5 md:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        <motion.article
          className="glass-panel flex min-h-[360px] flex-col items-center p-6 text-center transition duration-200 hover:border-white/20"
          variants={fadeInUp}
        >
          <h3 className="heading-font text-xl font-bold text-white">FREE</h3>
          <p className="mt-2 text-3xl font-black text-white">€0/mo</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>3 timers</li>
            <li>7-day history</li>
            <li>Today overview</li>
          </ul>
          <button
            type="button"
            className="mt-auto w-full rounded-xl border border-white/15 bg-white/5 py-3 pt-[10px] font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Stay on Free
          </button>
        </motion.article>

        <motion.article
          className="glass-panel relative flex min-h-[360px] flex-col items-center p-6 text-center ring-1 ring-emerald-500/35 transition duration-200 hover:border-white/20"
          variants={fadeInUp}
        >
          <span className="absolute right-5 top-5 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
            Most popular
          </span>
          <h3 className="heading-font text-xl font-bold text-white">PRO</h3>
          <p className="mt-2 text-3xl font-black text-white">€2,00/mo</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>Unlimited timers</li>
            <li>Full dashboard + heatmap</li>
            <li>AI coach</li>
            <li>Smart reminders</li>
            <li>Monthly report</li>
          </ul>
          <a
            href="#waitlist"
            className="mt-auto block w-full rounded-xl bg-emerald-500 py-3 pt-[10px] text-center font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            Join the waitlist →
          </a>
        </motion.article>

        <motion.article
          className="glass-panel flex min-h-[360px] flex-col items-center p-6 text-center transition duration-200 hover:border-white/20"
          variants={fadeInUp}
        >
          <h3 className="heading-font text-xl font-bold text-white">LIFETIME</h3>
          <p className="mt-2 text-3xl font-black text-white">€20,00 one-time</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>Everything in Pro</li>
            <li>Yours forever</li>
            <li>Early-bird price</li>
          </ul>
          <button
            type="button"
            className="mt-auto w-full rounded-xl border border-white/15 bg-white/5 py-3 pt-[10px] font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Early-bird deal
          </button>
        </motion.article>
      </motion.div>
    </section>
  );
}
