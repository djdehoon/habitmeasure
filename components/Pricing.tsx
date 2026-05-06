"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportIn } from "./motion";

export function Pricing() {
  return (
    <section id="prijzen" className="container-shell section-wrap flex flex-col items-center text-center">
      <motion.h2
        className="heading-font text-3xl font-black md:text-5xl"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        Fair pricing. Always.
      </motion.h2>

      <motion.div
        className="mt-10 grid w-full max-w-5xl gap-5 md:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        <motion.article className="card-shell flex min-h-[360px] flex-col p-6" variants={fadeInUp}>
          <h3 className="heading-font text-xl font-bold">FREE</h3>
          <p className="mt-2 text-3xl font-black">€0/mo</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-500">
            <li>3 timers</li>
            <li>7-day history</li>
            <li>Today overview</li>
          </ul>
          <button className="btn-ghost mt-auto w-full pt-[60px]">Stay on Free</button>
        </motion.article>

        <motion.article
          className="card-shell relative flex min-h-[360px] flex-col bg-[#F8FAFC] p-6"
          variants={fadeInUp}
        >
          <span className="badge-pill absolute right-5 top-5">Most popular</span>
          <h3 className="heading-font text-xl font-bold">PRO</h3>
          <p className="mt-2 text-3xl font-black">€2,00/mo</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-500">
            <li>Unlimited timers</li>
            <li>Full dashboard + heatmap</li>
            <li>AI coach</li>
            <li>Smart reminders</li>
            <li>Monthly report</li>
          </ul>
          <a href="#waitlist" className="btn-primary mt-auto block w-full pt-[60px] text-center">
            Join the waitlist →
          </a>
        </motion.article>

        <motion.article className="card-shell flex min-h-[360px] flex-col p-6" variants={fadeInUp}>
          <h3 className="heading-font text-xl font-bold">LIFETIME</h3>
          <p className="mt-2 text-3xl font-black">€20,00 one-time</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-500">
            <li>Everything in Pro</li>
            <li>Yours forever</li>
            <li>Early-bird price</li>
          </ul>
          <button className="btn-ghost mt-auto w-full pt-[60px]">Early-bird deal</button>
        </motion.article>
      </motion.div>
    </section>
  );
}
