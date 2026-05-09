"use client";

import { useEffect } from "react";
import { useCountdown } from "@/lib/hooks/useCountdown";

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
    if (state === "finished") onComplete?.();
  }, [state, onComplete]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - progress);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-8 text-[#1A1A2E]">
      <h1 className="heading-font text-center text-2xl font-bold md:text-3xl">{timerName}</h1>

      <div className="relative mt-10 h-64 w-64 md:h-72 md:w-72">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#F5F7FA" strokeWidth="4" />
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
          <span className="heading-font text-5xl font-black text-[#1A1A2E] md:text-6xl">{formatClock(timeRemaining)}</span>
        </div>
      </div>

      {state === "finished" ? (
        <p className="mt-8 text-lg font-semibold text-[#0C3D3A]">Habit complete! 🎉</p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {state === "idle" ? (
          <button
            type="button"
            onClick={() => start(durationSeconds)}
            className="rounded-full bg-[#00E5C0] px-8 py-3 text-base font-semibold text-[#0C3D3A] transition hover:bg-[#00d4b2]"
          >
            ▶ Start
          </button>
        ) : null}

        {state === "running" ? (
          <button
            type="button"
            onClick={pause}
            className="rounded-full bg-[#00E5C0] px-8 py-3 text-base font-semibold text-[#0C3D3A] transition hover:bg-[#00d4b2]"
          >
            ⏸ Pause
          </button>
        ) : null}

        {state === "paused" ? (
          <button
            type="button"
            onClick={resume}
            className="rounded-full bg-[#00E5C0] px-8 py-3 text-base font-semibold text-[#0C3D3A] transition hover:bg-[#00d4b2]"
          >
            ▶ Resume
          </button>
        ) : null}

        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[#F5F7FA] px-8 py-3 text-base font-semibold text-[#1A1A2E] transition hover:bg-[#e9edf2]"
        >
          ↺ Reset
        </button>
      </div>
    </section>
  );
}
