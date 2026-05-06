"use client";

import { motion } from "framer-motion";
import { fadeInUp, float, viewportIn } from "./motion";

const heatClasses = [
  "heat-0",
  "heat-1",
  "heat-2",
  "heat-3",
  "heat-4",
  "heat-2",
  "heat-1",
  "heat-0",
  "heat-2",
  "heat-3",
  "heat-4",
  "heat-3",
  "heat-2",
  "heat-1",
  "heat-1",
  "heat-2",
  "heat-3",
  "heat-4",
  "heat-3",
  "heat-2",
  "heat-0",
  "heat-1",
  "heat-2",
  "heat-3",
  "heat-2",
  "heat-1",
  "heat-0",
  "heat-1",
];

export function PhoneMockups() {
  return (
    <section className="container-shell section-wrap">
      <motion.h2
        className="heading-font text-center text-3xl font-black md:text-5xl"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        Built for your day
      </motion.h2>
      <motion.p
        className="mx-auto mt-4 max-w-xl text-center text-slate-500"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        Clean design. No clutter. Just your habits.
      </motion.p>

      <div className="mt-10 flex flex-col items-center gap-8 lg:flex-row lg:justify-center">
        <motion.div className="phone-frame p-5" variants={float} animate="animate">
          <div className="mt-9 text-sm text-slate-500">Timers</div>
          <div className="mt-3 timer-grid">
            {[
              ["Focus Timer", "25m"],
              ["Morning routine", "30m"],
              ["Wind down", "30m"],
              ["Workout", "45m"],
              ["Mindfulness", "10m"],
              ["Reading", "20m"],
            ].map(([label, streak]) => (
              <div key={label} className="timer-circle" style={{ color: "#7E9AAF" }}>
                <span>{label}</span>
                <strong>{streak}</strong>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="phone-frame scale-105 p-5"
          variants={float}
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <div className="mt-9 flex items-center justify-between">
            <span className="text-sm text-slate-500">Today</span>
            <span className="badge-pill text-[11px]">Dashboard</span>
          </div>
          <div className="mt-5 mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#8BA2B5] text-center text-xs">
            <div>
              <strong>5 of 6</strong>
              <div className="text-slate-500">done</div>
            </div>
          </div>
          <div className="mt-5 heatmap-grid">
            {heatClasses.map((h, idx) => (
              <span key={idx} className={`heat-cell ${h}`} />
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-[#B8BFD8]/40 bg-[#B8BFD8]/18 p-3 text-xs text-[#5C6788]">
            You are most consistent on Tuesdays and Thursdays.
          </div>
        </motion.div>

        <motion.div className="phone-frame p-5" variants={float} animate="animate">
          <div className="mt-12 text-5xl text-[#8BA2B5]">✦</div>
          <h3 className="mt-4 heading-font text-lg font-bold">Insight for today</h3>
          <div className="mt-4 rounded-xl border border-[#A7BFD2]/35 bg-[#F3F6FA] p-3 text-sm text-slate-500">
            You always meditate after coffee ☕ — solid pattern!
          </div>
          <div className="mt-4 inline-flex rounded-full border border-[#A7BFD2]/40 px-3 py-1 text-sm text-[#526C82]">
            7-day streak
          </div>
        </motion.div>
      </div>
    </section>
  );
}
