"use client";

import { useEffect, useRef } from "react";
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
  const firstCardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const logAlignment = () => {
      const card = firstCardRef.current;
      if (!card) return;
      const cardStyle = window.getComputedStyle(card);

      // #region agent log
      fetch("http://127.0.0.1:7590/ingest/c26c24ef-b105-424a-8eca-912c561200b9", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "61b61d",
        },
        body: JSON.stringify({
          sessionId: "61b61d",
          runId: "align-check",
          hypothesisId: "H-howitworks-card-align",
          location: "components/HowItWorks.tsx:first-card",
          message: "HowItWorks first card computed alignment",
          data: {
            viewportWidth: window.innerWidth,
            cardTextAlign: cardStyle.textAlign,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    };

    const raf = requestAnimationFrame(logAlignment);
    window.addEventListener("resize", logAlignment);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", logAlignment);
    };
  }, []);

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
        {steps.map(([num, title, text], index) => (
          <motion.article
            ref={index === 0 ? firstCardRef : undefined}
            key={num}
            className="card-shell p-6 text-center"
            variants={fadeInUp}
          >
            <div className="heading-font text-4xl font-black text-[#6D8294]">{num}</div>
            <h3 className="mt-4 heading-font text-xl font-bold">{title}</h3>
            <p className="mt-3 text-sm text-slate-500">{text}</p>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}
