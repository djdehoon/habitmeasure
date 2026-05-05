"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportIn } from "./motion";

export function Pricing() {
  return (
    <section id="prijzen" className="container-shell section-wrap">
      <motion.h2
        className="heading-font text-3xl font-black md:text-5xl"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        Eerlijk geprijsd. Altijd.
      </motion.h2>

      <motion.div
        className="mt-10 grid gap-5 md:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        <motion.article className="card-shell p-6" variants={fadeInUp}>
          <h3 className="heading-font text-xl font-bold">FREE</h3>
          <p className="mt-2 text-3xl font-black">€0/mnd</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-500">
            <li>3 timers</li>
            <li>7 dagen history</li>
            <li>Vandaag-overzicht</li>
          </ul>
          <button className="btn-ghost mt-6 w-full">Gratis blijven</button>
        </motion.article>

        <motion.article className="card-shell relative bg-[#F8FAFC] p-6" variants={fadeInUp}>
          <span className="badge-pill absolute right-5 top-5">Meest populair</span>
          <h3 className="heading-font text-xl font-bold">PRO</h3>
          <p className="mt-2 text-3xl font-black">€2,00/mnd</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-500">
            <li>Onbeperkte timers</li>
            <li>Volledig dashboard + heatmap</li>
            <li>AI Coach</li>
            <li>Slimme reminders</li>
            <li>Maandrapport</li>
          </ul>
          <a href="#waitlist" className="btn-primary mt-6 block w-full text-center">
            Kom op de wachtlijst
          </a>
        </motion.article>

        <motion.article className="card-shell p-6" variants={fadeInUp}>
          <h3 className="heading-font text-xl font-bold">LIFETIME</h3>
          <p className="mt-2 text-3xl font-black">€20,00 eenmalig</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-500">
            <li>Alles van Pro</li>
            <li>Voor altijd</li>
            <li>Early bird prijs</li>
          </ul>
          <button className="btn-ghost mt-6 w-full">Early bird deal</button>
        </motion.article>
      </motion.div>
    </section>
  );
}
