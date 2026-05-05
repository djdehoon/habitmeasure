"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportIn } from "./motion";

const pains = [
  {
    icon: "😤",
    title: "Je vergeet het",
    text: "Je neemt je voor om dagelijks te stretchen. Maar na dag 3 vergeet je het gewoon.",
  },
  {
    icon: "📊",
    title: "Je ziet geen vooruitgang",
    text: "Zonder data weet je niet of je beter wordt. Goed gevoel ≠ echte vooruitgang.",
  },
  {
    icon: "📱",
    title: "Teveel apps",
    text: "Een timer-app. Een habit-app. Een notitie-app. Het moet simpeler.",
  },
];

export function Problem() {
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
          hypothesisId: "H-problem-card-align",
          location: "components/Problem.tsx:first-card",
          message: "Problem first card computed alignment",
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
      id="how"
      className="container-shell section-wrap flex flex-col items-center"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportIn}
    >
      <h2 className="heading-font text-center text-3xl font-black md:text-5xl">
        Je weet wat je moet doen.
      </h2>
      <p className="mt-4 max-w-2xl text-center text-slate-500">
        Maar bijhouden of je het ook echt doet? Dat is het probleem.
      </p>
      <motion.div
        className="mt-10 grid w-full gap-5 md:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        {pains.map((pain, index) => (
          <motion.article
            ref={index === 0 ? firstCardRef : undefined}
            key={pain.title}
            className="card-shell p-6 text-center"
            variants={fadeInUp}
          >
            <p className="text-2xl">{pain.icon}</p>
            <h3 className="mt-4 heading-font text-xl font-bold">{pain.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{pain.text}</p>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}
