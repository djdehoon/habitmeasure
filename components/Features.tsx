"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportIn } from "./motion";

const featureCards = [
  {
    title: "⏱️ Slimme Timers",
    text: "Kleurrijke timers voor elke gewoonte. Ochtend routine, meditatie, wandeling — allemaal in één overzicht.",
    tags: ["Kleurcodering", "Interval timers", "Routines"],
  },
  {
    title: "📊 Voortgang Dashboard",
    text: "Heatmap, streaks en weekvergelijking. Zie in één oogopslag hoe consistent je bent.",
    tags: ["Heatmap", "Streaks", "Weekoverzicht"],
  },
  {
    title: "🤖 AI Coach",
    text: "HabitMeasure herkent jouw patronen. Wanneer je het doet, hoe vaak, en wat je kunt verbeteren.",
    tags: ["Patroonherkenning", "Slimme reminders", "Maandrapport"],
  },
];

export function Features() {
  return (
    <section id="features" className="container-shell section-wrap">
      <motion.h2
        className="heading-font text-3xl font-black md:text-5xl"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        Alles wat je nodig hebt. Niets wat je niet nodig hebt.
      </motion.h2>

      <motion.div
        className="mt-10 grid gap-5 md:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        {featureCards.map((card) => (
          <motion.article key={card.title} className="card-shell p-6" variants={fadeInUp}>
            <h3 className="heading-font text-xl font-bold">{card.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{card.text}</p>
            <div className="mt-5 flex flex-wrap gap-2">
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
