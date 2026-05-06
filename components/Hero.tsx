"use client";

import { motion } from "framer-motion";
import { LocaleBanner } from "@/components/LocaleBanner";
import { float, glowPulse, viewportIn } from "./motion";

export function Hero() {
  return (
    <section className="container-shell flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-9 py-16 text-center">
      <motion.span
        className="badge-pill mx-auto inline-flex max-w-[28rem] justify-center px-4 text-center whitespace-normal"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        ✨ Coming soon — habit timer app
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
        Build habits that
        <br />
        <span className="gradient-text">actually stick.</span>
      </motion.h1>

      <motion.p
        className="max-w-xl text-[17px] leading-8 text-slate-500"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        HabitMeasure helps you track, time, and measure your daily habits — so you can see real progress.
      </motion.p>

      <LocaleBanner />

      <motion.div
        className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex w-full flex-col items-center gap-2 sm:w-auto">
          <motion.a
            href="#waitlist"
            className="btn-primary w-full sm:w-auto"
            variants={glowPulse}
            animate="animate"
          >
            Join the waitlist →
          </motion.a>
          <p className="text-xs tracking-wide text-slate-500">
            Free · No credit card · Be first
          </p>
        </div>
        <a href="#how" className="btn-ghost w-full sm:w-auto">
          See how it works
        </a>
      </motion.div>

      <p className="text-xs tracking-wide text-slate-400">
        Join 200+ people already on the list
      </p>

      <motion.div
        className="phone-frame p-6 text-left"
        variants={float}
        animate="animate"
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        <div className="mt-8 text-xs text-slate-500">Today</div>
        <div className="mt-2 heading-font text-xl font-bold">Morning routine</div>
        <div className="mt-6 timer-grid">
          {[
            ["#7E9AAF", "Routine", "12d"],
            ["#90A8BA", "Meditation", "7d"],
            ["#7FA89D", "Walk", "4d"],
            ["#A2A9C1", "Workout", "9d"],
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
