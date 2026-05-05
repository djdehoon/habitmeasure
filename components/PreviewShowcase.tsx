"use client";

import { motion } from "framer-motion";
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

const radius = 72;
const circumference = 2 * Math.PI * radius;
const progress = 0.65;
const dashOffset = circumference * (1 - progress);
const tickCount = 72;
const tickRadius = 84;
const tickCenter = 95;

const roundCoord = (value: number) => Number(value.toFixed(3));

const tickData = Array.from({ length: tickCount }).map((_, i) => {
  const angle = (i / tickCount) * Math.PI * 2 - Math.PI / 2;
  const x1 = roundCoord(tickCenter + Math.cos(angle) * (tickRadius - 8));
  const y1 = roundCoord(tickCenter + Math.sin(angle) * (tickRadius - 8));
  const x2 = roundCoord(tickCenter + Math.cos(angle) * tickRadius);
  const y2 = roundCoord(tickCenter + Math.sin(angle) * tickRadius);
  const color =
    i % 18 < 5 ? "#22D3EE" : i % 18 < 10 ? "#FF8C42" : i % 18 < 14 ? "#EF4444" : "#4F46E5";

  return { i, x1, y1, x2, y2, color };
});

export function PreviewShowcase() {
  return (
    <section className="container-shell section-wrap flex flex-col items-center">
      <motion.div
        className="mx-auto max-w-3xl text-center"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        <span className="badge-pill">Binnenkort live — schrijf je in voor early access</span>
        <h2 className="heading-font mt-5 text-3xl font-black md:text-5xl">Product preview</h2>
        <p className="mt-4 text-slate-500">
          Timer en dashboard in een overzichtelijke preview van je dagelijkse voortgang.
        </p>
      </motion.div>

      <div className="relative mt-10 flex w-full justify-center">
        <div className="pointer-events-none absolute inset-0 m-auto h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(111,168,232,0.11)_0%,transparent_70%)]" />

        <div className="relative z-10 mx-auto flex w-fit items-end justify-center gap-4 md:gap-3">
          <motion.figure
            className="preview-phone rotate-0 md:-rotate-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportIn}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0 }}
          >
            <div className="preview-phone-notch" />
            <div className="flex h-full flex-col justify-between pt-5">
              <span className="inline-flex w-fit rounded-full border border-[#4ECDC4]/35 bg-[#4ECDC4]/15 px-3 py-1 text-[11px] font-medium text-[#4ECDC4]">
                Morning Run 🏃
              </span>

              <div className="mx-auto flex flex-col items-center">
                <svg width="190" height="190" viewBox="0 0 190 190" className="overflow-visible">
                  {tickData.map(({ i, x1, y1, x2, y2, color }) => {
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        opacity={0.95}
                      />
                    );
                  })}
                  <circle
                    cx="95"
                    cy="95"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="95"
                    cy="95"
                    r={radius}
                    fill="none"
                    stroke="#6FA8E8"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 95 95)"
                  />
                </svg>
                <div className="-mt-32 w-full text-center">
                  <p className="heading-font text-[52px] leading-none font-bold tracking-tight text-white/90">
                    18:32
                  </p>
                  <p className="mt-1 text-xs tracking-wide text-[#8892A4]">bezig...</p>
                </div>
              </div>

              <button className="rounded-full bg-[#4F8FD8] px-5 py-2.5 text-sm font-bold text-[#F7FBFF]">
                Pauzeer
              </button>
            </div>
          </motion.figure>

          <motion.figure
            className="preview-phone hidden rotate-0 md:block md:rotate-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportIn}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          >
            <div className="preview-phone-notch" />
            <div className="pt-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Deze week 🔥</p>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90">
                  Vandaag
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-white/15 bg-white/[0.03] p-3">
                <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-white/60">
                  <span>Ma</span>
                  <span>Di</span>
                  <span>Wo</span>
                  <span>Do</span>
                  <span>Vr</span>
                  <span>Za</span>
                  <span>Zo</span>
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
                  <p className="heading-font text-[22px] leading-none font-bold text-[#FF8C42]">14</p>
                  <p className="mt-1 text-[10px] font-medium text-white/75">dagen streak</p>
                </div>
                <div className="rounded-[10px] border border-white/10 bg-white/[0.05] p-2">
                  <p className="heading-font text-[22px] leading-none font-bold text-[#4ECDC4]">52 min</p>
                  <p className="mt-1 text-[10px] font-medium text-white/75">vandaag</p>
                </div>
                <div className="rounded-[10px] border border-white/10 bg-white/[0.05] p-2">
                  <p className="heading-font text-[22px] leading-none font-bold text-[#6FA8E8]">91%</p>
                  <p className="mt-1 text-[10px] font-medium text-white/75">on track</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2.5 text-sm font-medium text-white/85">
                Je bent het sterkst op maandag en donderdag.
              </div>
            </div>
          </motion.figure>
        </div>
      </div>

    </section>
  );
}
