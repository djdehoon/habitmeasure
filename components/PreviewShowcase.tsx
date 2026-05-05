"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { fadeInUp, viewportIn } from "./motion";

const dayHeaders = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

const matrixRows = [
  {
    habit: "Mobility",
    icon: "🧘",
    color: "bg-cyan-400",
    values: [1, 1, 1, 0, 1, 0, 1],
  },
  {
    habit: "Meditatie",
    icon: "🫁",
    color: "bg-orange-400",
    values: [1, 0, 1, 1, 0, 1, 0],
  },
  {
    habit: "Wandeling",
    icon: "🚶",
    color: "bg-blue-500",
    values: [0, 1, 1, 1, 1, 0, 1],
  },
  {
    habit: "Hydratatie",
    icon: "💧",
    color: "bg-violet-400",
    values: [1, 1, 0, 1, 1, 1, 0],
  },
];

const timers = [
  { name: "Mobility", value: "06:45", streak: "12 dagen", icon: "🧘", color: "bg-cyan-400" },
  { name: "Meditatie", value: "10:00", streak: "7 dagen", icon: "🫁", color: "bg-orange-400" },
  { name: "Focus blok", value: "25:00", streak: "9 dagen", icon: "🎯", color: "bg-blue-500" },
  { name: "Hydratatie", value: "02:00", streak: "14 dagen", icon: "💧", color: "bg-violet-400" },
];

export function PreviewShowcase() {
  const timerCardRef = useRef<HTMLElement | null>(null);
  const dashboardCardRef = useRef<HTMLElement | null>(null);
  const timerInnerRef = useRef<HTMLDivElement | null>(null);
  const dashboardInnerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const logHeights = (runId: string) => {
      const timerCard = timerCardRef.current;
      const dashboardCard = dashboardCardRef.current;
      const timerInner = timerInnerRef.current;
      const dashboardInner = dashboardInnerRef.current;

      // #region agent log
      fetch("http://127.0.0.1:7590/ingest/c26c24ef-b105-424a-8eca-912c561200b9", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "1b39d9",
        },
        body: JSON.stringify({
          sessionId: "1b39d9",
          runId,
          hypothesisId: "H1_H2_H3_H4",
          location: "components/PreviewShowcase.tsx:PreviewShowcase.useEffect",
          message: "Preview height metrics captured",
          data: {
            viewportWidth: window.innerWidth,
            timerCardHeight: timerCard?.offsetHeight ?? null,
            dashboardCardHeight: dashboardCard?.offsetHeight ?? null,
            timerInnerHeight: timerInner?.offsetHeight ?? null,
            dashboardInnerHeight: dashboardInner?.offsetHeight ?? null,
            timerCaptionHeight:
              timerCard && timerInner ? timerCard.offsetHeight - timerInner.offsetHeight : null,
            dashboardContentGap:
              dashboardCard && dashboardInner
                ? dashboardCard.offsetHeight - dashboardInner.offsetHeight
                : null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    };

    logHeights("before-fix");
    const onResize = () => logHeights("before-fix-resize");
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <section className="container-shell section-wrap">
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

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <motion.figure
          ref={timerCardRef}
          className="card-shell flex flex-col p-4 md:p-5"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportIn}
        >
          <div
            ref={timerInnerRef}
            className="relative flex-1 overflow-hidden rounded-2xl bg-[#0B0D12] p-4"
          >
            <Image
              src="/preview-timer.png"
              alt="HabitMeasure timer preview"
              width={768}
              height={537}
              className="h-auto w-full rounded-xl"
              priority={false}
            />
          </div>
          <figcaption className="mt-4 text-center text-xs tracking-wide text-slate-400">
            Timer preview
          </figcaption>
        </motion.figure>

        <motion.figure
          ref={dashboardCardRef}
          className="card-shell flex flex-col p-4 md:p-5"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportIn}
        >
          <div
            ref={dashboardInnerRef}
            className="relative flex-1 overflow-hidden rounded-2xl bg-[#0B0D12] p-4 text-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="heading-font flex items-center gap-2 text-xl font-black">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400 text-sm text-slate-950">
                  📊
                </span>
                Dashboard preview
              </h3>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/90">
                Vandaag
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-white/20 bg-white/[0.06] p-4">
              <div className="grid grid-cols-[130px_repeat(7,minmax(0,1fr))] gap-2 text-xs text-white/80">
                <span className="font-semibold text-white/60">Gewoonte</span>
                {dayHeaders.map((day) => (
                  <span key={day} className="text-center font-semibold text-white/75">
                    {day}
                  </span>
                ))}
              </div>

              <div className="mt-3 space-y-2">
                {matrixRows.map((row) => (
                  <div
                    key={row.habit}
                    className="grid grid-cols-[130px_repeat(7,minmax(0,1fr))] items-center gap-2"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-white/95">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[11px]">
                        {row.icon}
                      </span>
                      {row.habit}
                    </span>
                    {row.values.map((value, idx) => (
                      <span
                        key={`${row.habit}-${idx}`}
                        className={`h-5 rounded-md border ${
                          value
                            ? `${row.color} border-transparent`
                            : "border-white/20 bg-white/[0.08]"
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-cyan-300/45 bg-cyan-300/12 p-3">
                <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-cyan-100">
                  <span>⚡</span> Daily score
                </p>
                <p className="heading-font mt-1 text-2xl font-black text-cyan-100">82 / 100</p>
              </div>
              <div className="rounded-xl border border-orange-300/45 bg-orange-300/12 p-3">
                <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-orange-100">
                  <span>🔥</span> Vandaag
                </p>
                <p className="heading-font mt-1 text-2xl font-black text-orange-100">5 van 6</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-white/20 bg-white/[0.08] p-3 text-sm font-medium text-white/85">
              Je bent het meest consistent op maandag, woensdag en donderdag.
            </div>
          </div>
          <figcaption className="mt-4 text-center text-xs tracking-wide text-slate-400">
            Dashboard preview
          </figcaption>
        </motion.figure>
      </div>

      <motion.article
        className="card-shell mx-auto mt-5 max-w-4xl p-5"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportIn}
      >
        <div className="flex items-center justify-between">
          <h3 className="heading-font text-lg font-bold">Andere timers in beeld</h3>
          <span className="text-xs tracking-wide text-slate-400">Overzicht</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {timers.map((timer) => (
            <div
              key={timer.name}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_6px_16px_rgba(15,23,42,0.08)]"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-slate-50 ${timer.color}`}>
                  {timer.icon}
                </span>
                {timer.name}
              </p>
              <p className="heading-font mt-1 text-2xl font-black tracking-tight">{timer.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{timer.streak} actief</p>
            </div>
          ))}
        </div>
      </motion.article>
    </section>
  );
}
