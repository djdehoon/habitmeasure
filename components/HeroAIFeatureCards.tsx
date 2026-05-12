"use client";

import { motion, useReducedMotion } from "framer-motion";

const cards = [
  {
    title: "AI Genereert",
    body: "Workouts en timers die passen bij jouw tempo, doelen en beschikbare tijd.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3v2m0 14v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M3 12h2m14 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          className="stroke-emerald-400"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="4" className="stroke-emerald-300/80" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Timer Loopt",
    body: "Interval- en countdown-fases met duidelijke signalen — jij blijft in de zone.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="13" r="8" className="stroke-sky-400" strokeWidth="1.5" />
        <path d="M12 9v5l3 2" className="stroke-sky-300" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 5V3M16 5l1-1" className="stroke-slate-500" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Wij Volgen",
    body: "Sessies en voortgang vastgelegd — zie patronen zonder extra administratie.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 19V5M8 17V9m4 8V7m4 10v-6m4 8V11" className="stroke-violet-400" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Jij Groeit",
    body: "Kleine stappen, meetbaar resultaat — volhouden wordt zichtbaar.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 19h14M7 15l3-4 3 3 4-6"
          className="stroke-amber-400"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M7 19v-4" className="stroke-amber-400/70" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function HeroAIFeatureCards() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="container-shell pb-16 pt-2 md:pb-20">
      <motion.ul
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
        variants={listVariants}
        initial={reduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {cards.map((card) => (
          <motion.li key={card.title} variants={cardVariants} className="glass-panel p-6 text-left">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
              {card.icon}
            </div>
            <h2 className="heading-font text-lg font-bold tracking-tight text-white">{card.title}</h2>
            <p className="mt-2 font-sans text-sm leading-relaxed text-slate-400">{card.body}</p>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
