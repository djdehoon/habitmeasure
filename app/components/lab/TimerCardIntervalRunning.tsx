"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { playPauseSound, playStartSound } from "@/app/lib/sounds";
import { useIntervalTimer } from "@/lib/hooks/useIntervalTimer";
import type { TimerTemplate } from "@/lib/utils/timerHelpers";

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const RING_RADIUS = 56;
const VIEWBOX = 160;
const CENTER = VIEWBOX / 2;

type TimerCardIntervalRunningProps = {
  template: TimerTemplate;
};

/** Inline interval (work/rest rounds) with ring + one-tap toggle (View mode compact cards). */
export function TimerCardIntervalRunning({ template }: TimerCardIntervalRunningProps) {
  const router = useRouter();
  const work = Math.max(1, Math.floor(Number(template.work_seconds)));
  const rest = Math.max(1, Math.floor(Number(template.rest_seconds)));
  const rounds = Math.max(1, Math.floor(Number(template.rounds)));

  const { runState, phase, timeRemaining, displayRound, progress, start, pause, resume, stop } =
    useIntervalTimer(work, rest, rounds);

  const circumference = useMemo(() => 2 * Math.PI * RING_RADIUS, []);
  const strokeOffset = circumference * (1 - progress);

  const handleTap = () => {
    if (runState === "idle") {
      playStartSound();
      start();
    } else if (runState === "running") {
      playPauseSound();
      pause();
    } else if (runState === "paused") {
      playStartSound();
      resume();
    } else if (runState === "finished") {
      playStartSound();
      start();
    }
  };

  const handleKeyToggle = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTap();
    }
  };

  const ariaLabel =
    runState === "idle"
      ? `Start interval for ${template.template_name}`
      : runState === "running"
        ? `Pause interval for ${template.template_name}`
        : runState === "paused"
          ? `Resume interval for ${template.template_name}`
          : `Restart interval for ${template.template_name}`;

  const progressStroke =
    runState === "paused"
      ? "#fbbf24"
      : runState === "finished"
        ? "#10b981"
        : phase === "work"
          ? "#ef4444"
          : "#22c55e";

  const borderClass =
    runState === "finished"
      ? "border-emerald-500"
      : runState === "paused"
        ? "border-amber-400"
        : runState === "running" && phase === "work"
          ? "border-red-400/70"
          : runState === "running" && phase === "rest"
            ? "border-emerald-400"
            : "border-slate-600";

  const hint =
    runState === "idle"
      ? "Tap to start"
      : runState === "running"
        ? "Tap to pause"
        : runState === "paused"
          ? "Tap to resume"
          : "Tap to restart";

  const timeClass =
    runState === "running" && phase === "work"
      ? "text-red-400 motion-safe:animate-pulse"
      : runState === "running" && phase === "rest"
        ? "text-emerald-400 motion-safe:animate-pulse"
        : runState === "paused"
          ? "text-amber-200"
          : runState === "finished"
            ? "text-emerald-400"
            : "text-slate-100";

  const roundLabel = `Round ${Math.min(displayRound, rounds)} / ${rounds}`;

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
            {runState === "finished" ? (
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
            ) : runState === "running" || runState === "paused" ? (
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
            {runState === "finished" ? (
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">Done</span>
            ) : null}
            <span className={`font-mono text-2xl font-bold tabular-nums ${timeClass}`}>
              {formatClock(timeRemaining)}
            </span>
            {runState !== "finished" && runState !== "idle" ? (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  phase === "work" ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {phase === "work" ? "Work" : "Rest"}
              </span>
            ) : null}
          </div>
        </div>

        {runState === "finished" ? (
          <p className="mt-2 text-xs font-medium text-emerald-400/90">{rounds} rounds complete</p>
        ) : null}

        <p className="mt-2 truncate text-xs text-slate-400">{template.template_name}</p>
        <p className="text-xs text-slate-500">{roundLabel}</p>
        <p
          className={`text-xs font-medium ${
            runState === "running"
              ? phase === "work"
                ? "text-red-400/90"
                : "text-emerald-400/90"
              : runState === "paused"
                ? "text-amber-400/90"
                : runState === "finished"
                  ? "text-emerald-400/90"
                  : "text-slate-500"
          }`}
        >
          {hint}
        </p>
      </div>

      {(runState === "running" || runState === "paused") && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            playPauseSound();
            stop();
          }}
          onKeyDown={(event) => event.stopPropagation()}
          className="w-full rounded-lg border border-slate-600 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-500 hover:bg-slate-800/80 hover:text-slate-200"
        >
          Reset
        </button>
      )}

      {runState === "idle" ? (
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
