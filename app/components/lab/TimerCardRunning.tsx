"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { playFinishSound, playPauseSound, playStartSound } from "@/app/lib/sounds";
import { useCountdown } from "@/lib/hooks/useCountdown";
import type { TimerTemplate } from "@/lib/utils/timerHelpers";

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const RING_RADIUS = 56;
const VIEWBOX = 160;
const CENTER = VIEWBOX / 2;

type TimerCardRunningProps = {
  template: TimerTemplate;
};

/** Inline countdown with ring + one-tap toggle (View mode compact cards). */
export function TimerCardRunning({ template }: TimerCardRunningProps) {
  const router = useRouter();
  const durationSeconds = Math.max(1, Math.floor(Number(template.duration_seconds)));
  const { state, timeRemaining, progress, start, pause, resume, reset } = useCountdown(durationSeconds);

  const circumference = useMemo(() => 2 * Math.PI * RING_RADIUS, []);
  const strokeOffset = circumference * (1 - progress);

  useEffect(() => {
    if (state === "finished") {
      playFinishSound();
    }
  }, [state]);

  const handleTap = () => {
    if (state === "idle") {
      playStartSound();
      start(durationSeconds);
    } else if (state === "running") {
      playPauseSound();
      pause();
    } else if (state === "paused") {
      playStartSound();
      resume();
    } else if (state === "finished") {
      playStartSound();
      start(durationSeconds);
    }
  };

  const handleKeyToggle = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTap();
    }
  };

  const ariaLabel =
    state === "idle"
      ? `Start timer for ${template.template_name}`
      : state === "running"
        ? `Pause timer for ${template.template_name}`
        : state === "paused"
          ? `Resume timer for ${template.template_name}`
          : `Restart timer for ${template.template_name}`;

  const borderClass =
    state === "running"
      ? "border-emerald-400"
      : state === "paused"
        ? "border-amber-400"
        : state === "finished"
          ? "border-emerald-500"
          : "border-slate-600";

  const progressStroke =
    state === "paused" ? "#fbbf24" : state === "finished" ? "#10b981" : "#34d399";

  const hint =
    state === "idle"
      ? "Tap to start"
      : state === "running"
        ? "Tap to pause"
        : state === "paused"
          ? "Tap to resume"
          : "Tap to restart";

  const timeClass =
    state === "running"
      ? "text-emerald-400 motion-safe:animate-pulse"
      : state === "paused"
        ? "text-amber-300"
        : state === "finished"
          ? "text-emerald-400"
          : "text-slate-100";

  return (
    <div className="space-y-3" onClick={(event) => event.stopPropagation()}>
      <div
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onClick={handleTap}
        onKeyDown={handleKeyToggle}
        className={`cursor-pointer rounded-2xl border-2 bg-slate-950/40 p-4 text-center outline-none transition hover:bg-slate-900/50 focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${borderClass}`}
      >
        <div className="mb-2 text-2xl leading-none" aria-hidden>
          {template.icon}
        </div>

        <div className="relative mx-auto h-36 w-36">
          <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} aria-hidden>
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RING_RADIUS}
              fill="none"
              className="stroke-slate-700"
              strokeWidth="8"
            />
            {state === "finished" ? (
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RING_RADIUS}
                fill="none"
                stroke="#10b981"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={0}
              />
            ) : state === "running" || state === "paused" ? (
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RING_RADIUS}
                fill="none"
                stroke={progressStroke}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            ) : null}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            {state === "finished" ? (
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">Done</span>
            ) : null}
            <span className={`font-mono text-2xl font-bold tabular-nums ${timeClass}`}>
              {formatClock(timeRemaining)}
            </span>
          </div>
        </div>

        {state === "finished" ? (
          <p className="mt-2 text-xs font-medium text-emerald-400/90">Routine complete</p>
        ) : null}

        <p className="mt-2 truncate text-xs text-slate-400">{template.template_name}</p>
        <p
          className={`text-xs font-medium ${
            state === "running"
              ? "text-emerald-400/90"
              : state === "paused"
                ? "text-amber-400/90"
                : state === "finished"
                  ? "text-emerald-400/90"
                  : "text-slate-500"
          }`}
        >
          {hint}
        </p>
      </div>

      {(state === "running" || state === "paused") && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            playPauseSound();
            reset();
          }}
          onKeyDown={(event) => event.stopPropagation()}
          className="w-full rounded-lg border border-slate-600 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-500 hover:bg-slate-800/80 hover:text-slate-200"
        >
          Reset
        </button>
      )}

      {state === "idle" ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            router.push(`/lab?edit=${template.id}`);
          }}
          onKeyDown={(event) => event.stopPropagation()}
          className="w-full rounded-lg border border-slate-600 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-500 hover:bg-slate-800/80 hover:text-slate-200"
        >
          Edit routine
        </button>
      ) : null}
    </div>
  );
}
