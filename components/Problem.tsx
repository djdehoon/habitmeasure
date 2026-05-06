"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportIn } from "./motion";

const pains = [
  {
    icon: "😤",
    title: "You keep forgetting",
    text: "You swear you'll stretch every day. By day three, it's gone.",
  },
  {
    icon: "📊",
    title: "You can't see progress",
    text: "Without data, you don't know if you're improving. A good feeling isn't real progress.",
  },
  {
    icon: "📱",
    title: "Too many apps",
    text: "A timer app. A habit app. A notes app. It should be simpler.",
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
        You know what to do.
      </h2>
      <p className="mt-4 max-w-2xl text-center text-slate-500">
        Tracking whether you actually do it? That is the hard part.
      </p>
      <motion.div
        className="mt-10 grid w-full gap-5 md:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        {pains.map((pain) => (
          <motion.article
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
