"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportIn } from "./motion";

const steps = [
  ["1", "⏱️ Start een timer", "Tap op je gewoonte. Geen invoer, geen gedoe. Gewoon beginnen."],
  [
    "2",
    "✅ Automatisch bijgehouden",
    "Timer klaar? HabitMeasure logt het automatisch. Jij hoeft niets te doen.",
  ],
  ["3", "📈 Zie je groei", "Je dashboard toont streaks, patronen en AI-inzichten. Elke dag beter."],
];

export function HowItWorks() {
  return (
    <motion.section
      className="container-shell section-wrap flex flex-col items-center"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportIn}
    >
      <h2 className="heading-font text-center text-3xl font-black md:text-5xl">
        Zo simpel werkt HabitMeasure
      </h2>
      <motion.div
        className="mt-10 grid w-full gap-5 md:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        {steps.map(([num, title, text]) => (
          <motion.article key={num} className="card-shell p-6" variants={fadeInUp}>
            <div className="heading-font text-4xl font-black text-[#6D8294]">{num}</div>
            <h3 className="mt-4 heading-font text-xl font-bold">{title}</h3>
            <p className="mt-3 text-sm text-slate-500">{text}</p>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}
