"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { playPauseSound, playStartSound } from "@/app/lib/sounds";
import { useActivityIntervalTimer } from "@/lib/hooks/useActivityIntervalTimer";
import { getIntervalActivities } from "@/lib/utils/intervalActivities";
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

/** Inline interval with ring + one-tap toggle (View mode compact cards). */
export function TimerCardIntervalRunning({ template }: TimerCardIntervalRunningProps) {
  const router = useRouter();
  const activities = useMemo(() => getIntervalActivities(template), [template]);

  const {
    timerState,
    currentActivityIndex,
    timeRemaining,
    phaseProgress,
    start,
    pause,
    resume,
    stop,
  } = useActivityIntervalTimer(activities);

  const currentActivity = activities[currentActivityIndex];
  const circumference = useMemo(() => 2 * Math.PI * RING_RADIUS, []);
  const strokeOffset = circumference * (1 - phaseProgress);

  const handleTap = () => {
    if (timerState === "idle") {
      playStartSound();
      start();
    } else if (timerState === "running") {
      playPauseSound();
      pause();
    } else if (timerState === "paused") {
      playStartSound();
      resume();
    } else if (timerState === "finished") {
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
    timerState === "idle"
      ? `Start interval for ${template.template_name}`
      : timerState === "running"
        ? `Pause interval for ${template.template_name}`
        : timerState === "paused"
          ? `Resume interval for ${template.template_name}`
          : `Restart interval for ${template.template_name}`;

  const progressStroke =
    timerState === "paused"
      ? "#fbbf24"
      : timerState === "finished"
        ? "#2196F3"
        : currentActivity?.color ?? "#E74C3C";

  const borderClass =
    timerState === "finished"
      ? "border-emerald-500"
      : timerState === "paused"
        ? "border-amber-400"
        : timerState === "running"
          ? "border-red-400/70"
          : "border-slate-600";

  const hint =
    timerState === "idle"
      ? "Tap to start"
      : timerState === "running"
        ? "Tap to pause"
        : timerState === "paused"
          ? "Tap to resume"
          : "Tap to restart";

  const timeClass =
    timerState === "running"
      ? "text-red-400 motion-safe:animate-pulse"
      : timerState === "paused"
        ? "text-amber-200"
        : timerState === "finished"
          ? "text-emerald-400"
          : "text-slate-100";

  const roundLabel = `Step ${Math.min(currentActivityIndex + 1, activities.length)} / ${activities.length}`;

  return (
    <div className="space-y-3" onClick={(event) => event.stopPropagation()}>
      <div
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onClick={handleTap}
        onKeyDown={handleKeyToggle}
        className={`cursor-pointer min-w-0 rounded-2xl border-2 bg-slate-950/40 p-4 text-center outline-none transition hover:bg-slate-900/50 focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${borderClass}`}
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
            {timerState === "finished" ? (
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RING_RADIUS}
                fill="none"
                stroke={progressStroke}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={0}
              />
            ) : timerState === "running" || timerState === "paused" || timerState === "idle" ? (
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-2">
            {timerState === "finished" ? (
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">Done</span>
            ) : null}
            <span className={`font-mono text-2xl font-bold tabular-nums ${timeClass}`}>
              {formatClock(timeRemaining)}
            </span>
            {timerState !== "finished" && timerState !== "idle" && currentActivity ? (
              <span className="line-clamp-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {currentActivity.name}
              </span>
            ) : null}
          </div>
        </div>

        {timerState === "finished" ? (
          <p className="mt-2 text-xs font-medium text-emerald-400/90">{activities.length} activities complete</p>
        ) : null}

        <p className="mt-2 min-w-0 break-words text-balance text-xs text-slate-400 [overflow-wrap:anywhere]">
          {template.template_name}
        </p>
        <p className="text-xs text-slate-500">{roundLabel}</p>
        <p className="text-xs font-medium text-slate-500">{hint}</p>
      </div>

      {(timerState === "running" || timerState === "paused") && (
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

      {timerState === "idle" ? (
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
