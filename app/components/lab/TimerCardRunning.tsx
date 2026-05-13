"use client";

import { useEffect } from "react";
import { playFinishSound, playPauseSound, playStartSound } from "@/app/lib/sounds";
import { useCountdown } from "@/lib/hooks/useCountdown";
import type { TimerTemplate } from "@/lib/utils/timerHelpers";

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type TimerCardRunningProps = {
  template: TimerTemplate;
};

/** Inline countdown for a single countdown template (View mode compact cards). */
export function TimerCardRunning({ template }: TimerCardRunningProps) {
  const durationSeconds = Math.max(1, Math.floor(Number(template.duration_seconds)));
  const { state, timeRemaining, start, pause, resume, reset } = useCountdown(durationSeconds);

  useEffect(() => {
    if (state === "finished") {
      playFinishSound();
    }
  }, [state]);

  return (
    <div className="text-center" onClick={(event) => event.stopPropagation()}>
      {state === "idle" ? (
        <>
          <p className="mb-3 font-mono text-2xl font-bold text-emerald-400">{formatClock(timeRemaining)}</p>
          <button
            type="button"
            onClick={() => {
              playStartSound();
              start(durationSeconds);
            }}
            className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Start
          </button>
        </>
      ) : null}

      {state === "running" ? (
        <>
          <p className="mb-3 font-mono text-3xl font-bold text-emerald-400 motion-safe:animate-pulse">
            {formatClock(timeRemaining)}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                playPauseSound();
                pause();
              }}
              className="flex-1 rounded-lg bg-amber-500 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Pause
            </button>
            <button
              type="button"
              onClick={() => {
                playPauseSound();
                reset();
              }}
              className="flex-1 rounded-lg bg-slate-700 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-600"
            >
              Reset
            </button>
          </div>
        </>
      ) : null}

      {state === "paused" ? (
        <>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-400">Paused</p>
          <p className="mb-3 font-mono text-3xl font-bold text-slate-300">{formatClock(timeRemaining)}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                playStartSound();
                resume();
              }}
              className="flex-1 rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={() => {
                playPauseSound();
                reset();
              }}
              className="flex-1 rounded-lg bg-slate-700 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-600"
            >
              Reset
            </button>
          </div>
        </>
      ) : null}

      {state === "finished" ? (
        <>
          <p className="mb-1 text-2xl" aria-hidden>
            Done
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-400">Routine complete</p>
          <button
            type="button"
            onClick={() => {
              playStartSound();
              start(durationSeconds);
            }}
            className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Start again
          </button>
        </>
      ) : null}
    </div>
  );
}
