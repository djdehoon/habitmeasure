"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportIn } from "./motion";

const featureCards = [
  {
    title: "⏱️ Smart timers",
    text: "Color-coded timers for every habit. Morning routine, meditation, walks — all in one view.",
    tags: ["Color coding", "Interval timers", "Routines"],
  },
  {
    title: "📊 Progress dashboard",
    text: "Heatmap, streaks, and week-over-week comparison. See your consistency at a glance.",
    tags: ["Heatmap", "Streaks", "Week view"],
  },
  {
    title: "🤖 AI coach",
    text: "HabitMeasure spots your patterns — when you show up, how often, and what to tighten up.",
    tags: ["Pattern detection", "Smart nudges", "Monthly recap"],
  },
];

export function Features() {
  return (
    <section id="features" className="container-shell section-wrap flex flex-col items-center">
      <motion.h2
        className="heading-font text-center text-3xl font-black md:text-5xl"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        Everything you need. Nothing extra.
      </motion.h2>

      <motion.div
        className="mt-10 grid w-full gap-5 md:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        {featureCards.map((card) => (
          <motion.article key={card.title} className="card-shell p-6 text-center" variants={fadeInUp}>
            <h3 className="heading-font text-xl font-bold">{card.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{card.text}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {card.tags.map((tag) => (
                <span key={tag} className="badge-pill text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
