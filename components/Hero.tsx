"use client";

import { motion } from "framer-motion";
import { float, glowPulse, viewportIn } from "./motion";

export function Hero() {
  return (
    <section className="container-shell flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-9 py-16 text-center">
      <motion.span
        className="badge-pill"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Binnenkort live — schrijf je in voor early access
      </motion.span>

      <motion.p
        className="heading-font text-sm font-bold uppercase tracking-[0.35em] text-slate-500 md:text-base"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        Habit Measure
      </motion.p>

      <motion.h1
        className="heading-font text-5xl font-black tracking-[-0.02em] leading-tight md:text-7xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Kleine gewoontes.
        <br />
        <span className="gradient-text">Grote verandering.</span>
      </motion.h1>

      <motion.p
        className="max-w-xl text-[17px] leading-8 text-slate-500"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Start een timer. HabitMeasure onthoudt de rest. Zie je groei dag na dag.
      </motion.p>

      <motion.div
        className="flex flex-col items-center gap-4 sm:flex-row"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.a
          href="#waitlist"
          className="btn-primary"
          variants={glowPulse}
          animate="animate"
        >
          Kom op de wachtlijst →
        </motion.a>
        <a href="#how" className="btn-ghost">
          Bekijk hoe het werkt
        </a>
      </motion.div>

      <p className="text-xs tracking-wide text-slate-400">312 mensen wachten al op HabitMeasure</p>

      <motion.div
        className="phone-frame p-6 text-left"
        variants={float}
        animate="animate"
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        <div className="mt-8 text-xs text-slate-500">Vandaag</div>
        <div className="mt-2 heading-font text-xl font-bold">Ochtend routine</div>
        <div className="mt-6 timer-grid">
          {[
            ["#7E9AAF", "Routine", "12d"],
            ["#90A8BA", "Meditatie", "7d"],
            ["#7FA89D", "Wandeling", "4d"],
            ["#A2A9C1", "Water", "9d"],
          ].map(([color, label, streak]) => (
            <div key={label} className="timer-circle" style={{ color }}>
              <span>{label}</span>
              <strong>{streak}</strong>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
