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
    <section className="container-shell section-wrap">
      <motion.h2
        className="heading-font text-center text-3xl font-black md:text-5xl"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        Pick your first habit timer
      </motion.h2>
      <motion.p
        className="mt-4 text-center text-slate-500"
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
              className={`card-shell flex w-full flex-col items-center p-6 text-center ${
                selected
                  ? "ring-2 ring-[#00E5C0] ring-offset-2 ring-offset-white"
                  : ""
              }`}
            >
              <span className="text-4xl" aria-hidden>
                {timer.icon}
              </span>
              <span className="mt-3 heading-font text-xl font-bold">{timer.title}</span>
              <span className="mt-2 rounded-full bg-[#E8EAEF] px-3 py-1 text-sm font-medium text-[#6B7280]">
                {timer.duration}
              </span>
              <span className="mt-3 text-sm text-[#6B7280]">{timer.description}</span>
              <span className="btn-ghost mt-4 inline-flex items-center justify-center text-sm font-semibold">
                Try it →
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}
