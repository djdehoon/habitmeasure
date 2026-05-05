"use client";

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
        {pains.map((pain) => (
          <motion.article key={pain.title} className="card-shell p-6" variants={fadeInUp}>
            <p className="text-2xl">{pain.icon}</p>
            <h3 className="mt-4 heading-font text-xl font-bold">{pain.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{pain.text}</p>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}
