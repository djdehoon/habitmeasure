"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, float, viewportIn } from "./motion";

const heatClasses = [
  "heat-0",
  "heat-1",
  "heat-2",
  "heat-3",
  "heat-4",
  "heat-2",
  "heat-1",
  "heat-0",
  "heat-2",
  "heat-3",
  "heat-4",
  "heat-3",
  "heat-2",
  "heat-1",
  "heat-1",
  "heat-2",
  "heat-3",
  "heat-4",
  "heat-3",
  "heat-2",
  "heat-0",
  "heat-1",
  "heat-2",
  "heat-3",
  "heat-2",
  "heat-1",
  "heat-0",
  "heat-1",
];

export function PhoneMockups() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="container-shell section-wrap text-slate-100">
      <motion.h2
        className="heading-font text-center text-3xl font-black text-white md:text-5xl"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        Built for your day
      </motion.h2>
      <motion.p
        className="mx-auto mt-4 max-w-xl text-center text-slate-400"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        Clean design. No clutter. Just your habits.
      </motion.p>

      <div className="mt-10 flex flex-col items-center gap-8 lg:flex-row lg:justify-center">
        <motion.div
          className="phone-frame !border-white/12 !bg-slate-900/95 !shadow-[0_12px_28px_rgba(0,0,0,0.45)] p-5 text-slate-200"
          variants={float}
          animate={reduceMotion ? undefined : "animate"}
        >
          <div className="mt-9 text-sm text-slate-400">Timers</div>
          <div className="mt-3 timer-grid">
            {[
              ["Focus Timer", "25m"],
              ["Morning routine", "30m"],
              ["Wind down", "30m"],
              ["Routine", "45m"],
              ["Mindfulness", "10m"],
              ["Reading", "20m"],
            ].map(([label, streak]) => (
              <div
                key={label}
                className="timer-circle !border-slate-500 !bg-white/10 !text-slate-200"
                style={{ color: "#94a3b8" }}
              >
                <span>{label}</span>
                <strong>{streak}</strong>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="phone-frame scale-105 !border-white/12 !bg-slate-900/95 !shadow-[0_12px_28px_rgba(0,0,0,0.45)] p-5 text-slate-200"
          variants={float}
          animate={reduceMotion ? undefined : "animate"}
          transition={{ delay: 0.2 }}
        >
          <div className="mt-9 flex items-center justify-between">
            <span className="text-sm text-slate-400">Today</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              Dashboard
            </span>
          </div>
          <div className="mt-5 mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-emerald-500/40 text-center text-xs text-slate-200">
            <div>
              <strong className="text-white">5 of 6</strong>
              <div className="text-slate-400">done</div>
            </div>
          </div>
          <div className="mt-5 heatmap-grid">
            {heatClasses.map((h, idx) => (
              <span key={idx} className={`heat-cell ${h}`} />
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
            You are most consistent on Tuesdays and Thursdays.
          </div>
        </motion.div>

        <motion.div
          className="phone-frame !border-white/12 !bg-slate-900/95 !shadow-[0_12px_28px_rgba(0,0,0,0.45)] p-5 text-slate-200"
          variants={float}
          animate={reduceMotion ? undefined : "animate"}
        >
          <div className="mt-12 text-5xl text-emerald-400/80">✦</div>
          <h3 className="mt-4 heading-font text-lg font-bold text-white">Insight for today</h3>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            You always meditate after coffee ☕ — solid pattern!
          </div>
          <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
            7-day streak
          </div>
        </motion.div>
      </div>
    </section>
  );
}
