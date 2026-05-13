"use client";

import { useEffect } from "react";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { playFinishSound, playPauseSound, playStartSound } from "@/app/lib/sounds";

type TimerDisplayProps = {
  durationSeconds: number;
  timerName: string;
  onComplete?: () => void;
};

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function TimerDisplay({ durationSeconds, timerName, onComplete }: TimerDisplayProps) {
  const { state, timeRemaining, progress, start, pause, resume, reset } = useCountdown(durationSeconds);

  useEffect(() => {
    if (state === "finished") {
      playFinishSound();
      onComplete?.();
    }
  }, [state, onComplete]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - progress);

  return (
    <section className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-transparent px-4 py-4 text-slate-100 md:py-6">
      <h1 className="heading-font text-center text-2xl font-bold text-slate-100 md:text-3xl">{timerName}</h1>

      <div className="relative mt-2 h-64 w-64 md:mt-3 md:h-72 md:w-72">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgb(30 41 59)" strokeWidth="4" />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#00E5C0"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="heading-font text-5xl font-black text-slate-100 md:text-6xl">{formatClock(timeRemaining)}</span>
        </div>
      </div>

      {state === "finished" ? (
        <p className="mt-6 text-lg font-semibold text-emerald-300">Routine complete! 🎉</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {state === "idle" ? (
          <button
            type="button"
            onClick={() => {
              playStartSound();
              start(durationSeconds);
            }}
            className="rounded-full bg-[#00E5C0] px-8 py-3 text-base font-semibold text-[#0C3D3A] transition hover:bg-[#00d4b2]"
          >
            ▶ Start
          </button>
        ) : null}

        {state === "running" ? (
          <button
            type="button"
            onClick={() => {
              playPauseSound();
              pause();
            }}
            className="rounded-full bg-[#00E5C0] px-8 py-3 text-base font-semibold text-[#0C3D3A] transition hover:bg-[#00d4b2]"
          >
            ⏸ Pause
          </button>
        ) : null}

        {state === "paused" ? (
          <button
            type="button"
            onClick={() => {
              playStartSound();
              resume();
            }}
            className="rounded-full bg-[#00E5C0] px-8 py-3 text-base font-semibold text-[#0C3D3A] transition hover:bg-[#00d4b2]"
          >
            ▶ Resume
          </button>
        ) : null}

        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-slate-800 px-8 py-3 text-base font-semibold text-slate-100 transition hover:bg-slate-700"
        >
          ↺ Reset
        </button>
      </div>
    </section>
  );
}
