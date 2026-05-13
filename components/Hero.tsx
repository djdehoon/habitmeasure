"use client";

import { motion, useReducedMotion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="container-shell flex min-h-[min(88svh,52rem)] flex-col items-center justify-start gap-8 pb-12 pt-8 text-center md:gap-10 md:pb-16 md:pt-12">
      <motion.div
        className="flex w-full max-w-4xl flex-col items-center gap-6 md:gap-8"
        variants={containerVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
      >
        <motion.p
          className="heading-font text-xs font-bold uppercase tracking-[0.32em] text-emerald-400/90 md:text-sm"
          variants={itemVariants}
        >
          HabitMeasure
        </motion.p>

        <motion.h1
          className="heading-font max-w-4xl text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-white md:text-5xl lg:text-6xl"
          variants={itemVariants}
        >
          <span className="bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            AI generates your routine.
          </span>
          <br />
          <span className="text-slate-100">Jij voert hem uit.</span>{" "}
          <span className="text-slate-300">Wij volgen je voortgang.</span>
        </motion.h1>

        <motion.p
          className="max-w-xl font-sans text-base leading-relaxed text-slate-400 md:text-lg"
          variants={itemVariants}
        >
          From morning sessions to focus sessions: smart timers, clear phases, and insight into what you actually stick with.
        </motion.p>

        <motion.div
          className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-center sm:gap-4"
          variants={itemVariants}
        >
          <motion.a
            href="#waitlist"
            className="w-full rounded-xl bg-emerald-400 px-8 py-3.5 text-center text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-300 sm:w-auto"
          >
            Schrijf je in →
          </motion.a>
          <motion.a
            href="#how"
            className="w-full rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-center text-base font-semibold text-slate-100 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 sm:w-auto"
          >
            Zo werkt het
          </motion.a>
        </motion.div>

        <motion.p
          className="max-w-md font-sans text-xs leading-relaxed tracking-wide text-slate-500"
          variants={itemVariants}
        >
          Early access. Bouw betere gewoontes — met AI die meedenkt en data die motiveert.
        </motion.p>
      </motion.div>
    </section>
  );
}
