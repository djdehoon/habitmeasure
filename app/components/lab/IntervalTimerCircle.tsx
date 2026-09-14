"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ProgressRing } from "@/app/components/lab/ProgressRing";
import { countdownRingColumnWidth } from "@/app/components/lab/countdownPremiumStyles";
import {
  calculateActivityBlocks,
  formatActivitiesTotalDuration,
  type IntervalActivity,
} from "@/lib/utils/intervalActivities";
import type { ActivityIntervalRunState } from "@/lib/hooks/useActivityIntervalTimer";
import { formatClock } from "@/lib/utils/countdownFormat";

export type IntervalCircleUiState = ActivityIntervalRunState | "waiting";

type IntervalTimerCircleProps = {
  activities: IntervalActivity[];
  currentActivityIndex: number;
  elapsedTime: number;
  globalElapsedTime: number;
  /** Drain progress 1→0 for current phase (or waiting). */
  phaseProgress: number;
  timerState: IntervalCircleUiState;
  waitingSeconds?: number;
  templateColor?: string;
  onRingClick?: () => void;
  ringAriaLabel?: string;
};

const PAUSED_COLOR = "#FF8C00";
const FINISHED_COLOR = "#22c55e";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function IntervalTimerCircle({
  activities,
  currentActivityIndex,
  elapsedTime,
  globalElapsedTime,
  phaseProgress,
  timerState,
  waitingSeconds = 0,
  templateColor = "#E74C3C",
  onRingClick,
  ringAriaLabel,
}: IntervalTimerCircleProps) {
  const ringContainerRef = useRef<HTMLDivElement>(null);
  const [ringRadius, setRingRadius] = useState(140);

  const currentActivity = activities[currentActivityIndex] ?? activities[0];
  const nextActivity =
    currentActivityIndex + 1 < activities.length ? activities[currentActivityIndex + 1] : null;
  const phaseDuration = currentActivity?.duration ?? 1;
  const timeRemaining =
    timerState === "waiting"
      ? Math.max(0, waitingSeconds)
      : Math.max(0, Math.ceil(phaseDuration - elapsedTime));

  const blocks = useMemo(
    () => calculateActivityBlocks(activities, globalElapsedTime),
    [activities, globalElapsedTime],
  );

  const ringColor =
    timerState === "paused"
      ? PAUSED_COLOR
      : timerState === "finished"
        ? FINISHED_COLOR
        : timerState === "idle" || timerState === "waiting"
          ? templateColor
          : currentActivity?.color ?? templateColor;

  const ringMode =
    timerState === "idle" ? "full" : timerState === "finished" ? "done" : "partial";
  const ringProgress =
    timerState === "idle"
      ? 1
      : timerState === "finished"
        ? 1
        : clamp01(phaseProgress);

  const isPulsing = timerState === "running";

  useEffect(() => {
    const element = ringContainerRef.current;
    if (!element) return;

    const updateRadius = () => {
      const { width, height } = element.getBoundingClientRect();
      const size = Math.min(width, height);
      if (size <= 0) return;
      const next = Math.floor(size / 2) - 10;
      setRingRadius(Math.min(180, Math.max(120, next)));
    };

    updateRadius();
    const observer = new ResizeObserver(updateRadius);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!currentActivity) {
    return null;
  }

  const statusLabel =
    timerState === "waiting"
      ? "WAIT"
      : timerState === "paused"
        ? "PAUSED"
        : timerState === "finished"
          ? "DONE"
          : timerState === "idle"
            ? "Ready"
            : `${currentActivityIndex + 1}. ${currentActivity.name}`;

  const showNext =
    Boolean(nextActivity) &&
    (timerState === "idle" || timerState === "running" || timerState === "paused");

  const interactive = Boolean(onRingClick);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!onRingClick) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onRingClick();
  };

  const face: ReactNode = (
    <>
      <p className="mb-2 text-sm text-[#999999]">Total: {formatActivitiesTotalDuration(activities)}</p>

      <div className="mb-3 grid max-w-[12.5rem] grid-cols-8 gap-1">
        {blocks.slice(0, 24).map((block, index) => (
          <div
            key={`${block.name}-${index}`}
            className="h-2.5 w-2.5 rounded-sm border border-gray-600 transition-[background-color,opacity] duration-1000"
            style={{
              backgroundColor: block.fillPercentage > 0 ? block.color : "transparent",
              opacity: block.fillPercentage > 0 ? block.fillPercentage / 100 : 1,
            }}
            title={block.name}
          />
        ))}
      </div>

      <p className="heading-font text-5xl font-bold tabular-nums text-white sm:text-7xl">
        {formatClock(timeRemaining)}
      </p>

      <div
        className="mt-2 h-px w-4/5 max-w-[14rem]"
        style={{ backgroundColor: ringColor, opacity: 0.5 }}
      />

      <p className="mt-2 text-base text-white">{statusLabel}</p>
      {showNext && nextActivity ? (
        <p className="mt-1 text-sm text-slate-400">
          Next: {currentActivityIndex + 2}. {nextActivity.name}
        </p>
      ) : null}
    </>
  );

  return (
    <div
      className={`relative mx-auto aspect-square ${countdownRingColumnWidth}${
        interactive
          ? " cursor-pointer select-none transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          : ""
      }`}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? ringAriaLabel : undefined}
      onClick={onRingClick}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <div
        ref={ringContainerRef}
        className={`absolute inset-0 ${timerState === "paused" ? "opacity-70" : ""}`}
      >
        <ProgressRing
          radius={ringRadius}
          color={ringColor}
          progress={ringProgress}
          mode={ringMode}
          isPulsing={isPulsing}
          strokeTransition={false}
          className={`h-full w-full ${timerState === "finished" ? "motion-safe:animate-bounce-ring" : ""}`}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 py-8 text-center">
        {face}
      </div>
    </div>
  );
}
