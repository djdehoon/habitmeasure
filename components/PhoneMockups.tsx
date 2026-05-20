"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, viewportIn } from "./motion";

const heatmap = [
  [0, 1, 2, 0, 3, 2, 1],
  [1, 0, 2, 3, 2, 1, 0],
  [2, 2, 3, 1, 0, 2, 1],
  [0, 1, 2, 1, 3, 3, 2],
  [1, 2, 0, 1, 2, 3, 1],
];

const heatClass: Record<number, string> = {
  0: "bg-white/[0.04]",
  1: "bg-[#6FA8E8]/26",
  2: "bg-[#4F8FD8]/62",
  3: "bg-[#3C78BF]",
};

const TIMERS = [
  ["Focus Timer", "25m", "#6FA8E8"],
  ["Morning routine", "30m", "#4F8FD8"],
  ["Wind down", "30m", "#4ECDC4"],
  ["Routine", "45m", "#FF8C42"],
  ["Mindfulness", "10m", "#6FA8E8"],
  ["Reading", "20m", "#4F46E5"],
] as const;

const phoneFloatTransition = (delay: number, reduceMotion: boolean | null) => ({
  duration: 3,
  repeat: reduceMotion ? 0 : Infinity,
  ease: "easeInOut" as const,
  delay,
});

export function PhoneMockups() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="container-shell section-wrap flex flex-col items-center text-slate-100">
      <motion.div
        className="mx-auto max-w-3xl text-center"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
          Designed for real routines
        </span>
        <h2 className="heading-font mt-5 text-3xl font-black text-white md:text-5xl">Built for your day</h2>
        <p className="mt-4 text-slate-400">Clean design. No clutter. Just your habits.</p>
      </motion.div>

      <div className="relative mt-10 flex w-full justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 m-auto h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(111,168,232,0.11)_0%,transparent_70%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[280px] flex-col items-center justify-center gap-4 md:max-w-none md:flex-row md:items-end md:gap-3">
          <motion.figure
            className="preview-phone preview-phone-premium mx-auto w-full max-w-[280px] rotate-0 md:mx-0 md:w-auto md:max-w-none md:-rotate-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportIn}
            animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={phoneFloatTransition(0, reduceMotion)}
          >
            <div className="preview-phone-notch" />
            <div className="pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Timers</p>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90">
                  All
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {TIMERS.map(([label, duration, accent]) => (
                  <div
                    key={label}
                    className="flex flex-col items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-2 py-3 text-center"
                  >
                    <span
                      className="mb-1.5 flex h-12 w-12 items-center justify-center rounded-full border-2 text-[10px] font-semibold leading-tight text-white/90"
                      style={{ borderColor: accent }}
                    >
                      {label.split(" ")[0]}
                    </span>
                    <span className="text-[10px] font-medium text-white/75">{label}</span>
                    <strong className="heading-font mt-0.5 text-sm font-bold" style={{ color: accent }}>
                      {duration}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </motion.figure>

          <motion.figure
            className="preview-phone preview-phone-premium mx-auto w-full max-w-[280px] rotate-0 md:mx-0 md:w-auto md:max-w-none md:rotate-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportIn}
            animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={phoneFloatTransition(0.75, reduceMotion)}
          >
            <div className="preview-phone-notch" />
            <div className="-translate-y-1 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">This week</p>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90">
                  Dashboard
                </span>
              </div>

              <div className="mt-3 flex items-center justify-center">
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-[3px] border-[#6FA8E8]/50 text-center">
                  <strong className="heading-font text-lg font-bold text-white/90">5 of 6</strong>
                  <span className="text-[10px] font-medium text-white/60">done</span>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-white/15 bg-white/[0.03] p-3">
                <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-white/60">
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                  <span>Su</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {heatmap.flatMap((row, rowIndex) =>
                    row.map((level, colIndex) => (
                      <span
                        key={`${rowIndex}-${colIndex}`}
                        className={`h-[13px] w-[13px] rounded-[3px] ${heatClass[level]}`}
                      />
                    )),
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-[10px] border border-white/10 bg-white/[0.05] p-2">
                  <p className="heading-font text-[22px] leading-none font-bold text-[#FF8C42]">7</p>
                  <p className="mt-1 text-[10px] font-medium text-white/75">day streak</p>
                </div>
                <div className="rounded-[10px] border border-white/10 bg-white/[0.05] p-2">
                  <p className="heading-font text-[22px] leading-none font-bold text-[#4ECDC4]">5/6</p>
                  <p className="mt-1 text-[10px] font-medium text-white/75">today</p>
                </div>
                <div className="rounded-[10px] border border-white/10 bg-white/[0.05] p-2">
                  <p className="heading-font text-[22px] leading-none font-bold text-[#6FA8E8]">83%</p>
                  <p className="mt-1 text-[10px] font-medium text-white/75">on track</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2.5 text-sm font-medium text-white/85">
                You are most consistent on Tuesdays and Thursdays.
              </div>
            </div>
          </motion.figure>

          <motion.figure
            className="preview-phone preview-phone-premium mx-auto w-full max-w-[280px] rotate-0 md:mx-0 md:w-auto md:max-w-none md:rotate-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportIn}
            animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={phoneFloatTransition(1.5, reduceMotion)}
          >
            <div className="preview-phone-notch" />
            <div className="pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Insight for today</p>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90">
                  AI
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-white/15 bg-white/[0.03] p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#6FA8E8]">Pattern</p>
                <p className="mt-2 text-sm font-medium leading-snug text-white/85">
                  You always meditate after coffee — solid pattern!
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-[10px] border border-white/10 bg-white/[0.05] p-2">
                  <p className="heading-font text-[22px] leading-none font-bold text-[#FF8C42]">7</p>
                  <p className="mt-1 text-[10px] font-medium text-white/75">day streak</p>
                </div>
                <div className="rounded-[10px] border border-white/10 bg-white/[0.05] p-2">
                  <p className="heading-font text-[22px] leading-none font-bold text-[#6FA8E8]">92%</p>
                  <p className="mt-1 text-[10px] font-medium text-white/75">habit fit</p>
                </div>
              </div>

              <div className="mt-3 inline-flex rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/85">
                Suggested: add a 5m wind-down after reading
              </div>
            </div>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
