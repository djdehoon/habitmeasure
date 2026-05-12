"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportIn } from "./motion";

const TIMERS = [
  {
    icon: "⏱️",
    title: "Focus timer",
    duration: "25 minuten",
    description: "Pomodoro — deep work without distractions",
  },
  {
    icon: "🌅",
    title: "Morning routine",
    duration: "30 minuten",
    description: "Start your day with intention",
  },
  {
    icon: "🌙",
    title: "Wind down",
    duration: "30 minuten",
    description: "Unwind and prepare for sleep",
  },
  {
    icon: "🏃",
    title: "Workout",
    duration: "45 minuten",
    description: "Sport & energy",
  },
  {
    icon: "🧘",
    title: "Mindfulness",
    duration: "10 minuten",
    description: "Stress relief & focus",
  },
  {
    icon: "📖",
    title: "Reading",
    duration: "20 minuten",
    description: "Learn & rest",
  },
] as const;

export function TimerPreviewCards() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <section className="container-shell section-wrap text-slate-100">
      <motion.h2
        className="heading-font text-center text-3xl font-black text-white md:text-5xl"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        Pick your first habit timer
      </motion.h2>
      <motion.p
        className="mt-4 text-center text-slate-400"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        Tap a timer to see what fits your routine.
      </motion.p>

      <motion.div
        className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        {TIMERS.map((timer, index) => {
          const selected = selectedIndex === index;
          return (
            <motion.button
              key={timer.title}
              type="button"
              onClick={() => setSelectedIndex(index)}
              whileTap={{ scale: 0.99 }}
              variants={fadeInUp}
              className={`glass-panel flex w-full flex-col items-center p-6 text-center outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 hover:border-white/20 ${
                selected
                  ? "ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-slate-950 bg-white/[0.08]"
                  : ""
              }`}
            >
              <span className="text-4xl" aria-hidden>
                {timer.icon}
              </span>
              <span className="mt-3 heading-font text-xl font-bold text-white">{timer.title}</span>
              <span className="mt-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-medium text-slate-300">
                {timer.duration}
              </span>
              <span className="mt-3 text-sm text-slate-400">{timer.description}</span>
              <span className="mt-4 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                Try it →
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}
