"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ProgressRing } from "@/app/components/lab/ProgressRing";
import { countdownRingColumnWidth } from "@/app/components/lab/countdownPremiumStyles";
import {
  calculateActivityBlocks,
  computeActivitiesDurationSeconds,
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
/** Gap between outer ticks and inner ProgressRing. */
const RING_GAP = 12;
const TICK_LENGTH = 9;
const TARGET_TICKS = 64;

type ActivityTick = {
  angle: number;
  color: string;
  opacity: number;
  key: string;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function polar(cx: number, cy: number, r: number, angleRad: number) {
  // Round so SSR and client serialize identical SVG attributes (avoid hydration mismatch).
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return {
    x: round(cx + r * Math.cos(angleRad)),
    y: round(cy + r * Math.sin(angleRad)),
  };
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

  const totalSeconds = useMemo(
    () => Math.max(1, computeActivitiesDurationSeconds(activities)),
    [activities],
  );

  const totalRemainingSeconds =
    timerState === "finished"
      ? 0
      : timerState === "idle" || timerState === "waiting"
        ? totalSeconds
        : Math.max(0, Math.ceil(totalSeconds - globalElapsedTime));

  const blocks = useMemo(
    () => calculateActivityBlocks(activities, globalElapsedTime),
    [activities, globalElapsedTime],
  );

  const progressRatio =
    timerState === "idle" || timerState === "waiting"
      ? 0
      : timerState === "finished"
        ? 1
        : clamp01(globalElapsedTime / totalSeconds);

  const activityTicks = useMemo(() => {
    const ticks: ActivityTick[] = [];
    let cumulative = 0;

    for (let i = 0; i < activities.length; i += 1) {
      const activity = activities[i];
      const duration = Math.max(1, Math.floor(activity.duration));
      const startRatio = cumulative / totalSeconds;
      const endRatio = (cumulative + duration) / totalSeconds;
      const span = Math.max(0.0001, endRatio - startRatio);
      const count = Math.max(3, Math.round(span * TARGET_TICKS));

      for (let t = 0; t < count; t += 1) {
        const ratio = startRatio + ((t + 0.5) / count) * span;
        const angle = -Math.PI / 2 + ratio * 2 * Math.PI;

        let opacity = 0.85;
        if (timerState === "finished") {
          opacity = 0.4;
        } else if (timerState === "running" || timerState === "paused") {
          if (ratio <= progressRatio) {
            opacity = 0;
          } else if (i === currentActivityIndex) {
            opacity = 1;
          } else {
            opacity = 0.55;
          }
        }

        ticks.push({
          angle,
          color: activity.color?.trim() || templateColor,
          opacity,
          key: `${activity.id}-${t}`,
        });
      }

      cumulative += duration;
    }

    return ticks;
  }, [
    activities,
    totalSeconds,
    timerState,
    progressRatio,
    currentActivityIndex,
    templateColor,
  ]);

  const ringColor =
    timerState === "paused"
      ? PAUSED_COLOR
      : timerState === "finished" || timerState === "idle" || timerState === "waiting"
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

  // Outer ticks at the rim; solid ProgressRing inset inside
  const inset = RING_GAP + TICK_LENGTH;
  const tickMidRadius = Math.max(70, ringRadius - TICK_LENGTH / 2);
  const innerRadius = Math.max(80, ringRadius - inset);
  const viewSize = 2 * (ringRadius + 6);
  const center = viewSize / 2;

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
    (timerState === "idle" ||
      timerState === "waiting" ||
      timerState === "running" ||
      timerState === "paused");

  const interactive = Boolean(onRingClick);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!onRingClick) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onRingClick();
  };

  const face: ReactNode = (
    <>
      <p className="mb-2 text-sm tabular-nums text-[#999999]">
        Total: {formatClock(totalRemainingSeconds)}
      </p>

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

      <p className="mt-2 min-h-[1.5rem] max-w-[90%] truncate text-base text-white">{statusLabel}</p>
      <p className="mt-1 min-h-[1.25rem] max-w-[90%] truncate text-sm text-slate-400">
        {showNext && nextActivity ? (
          <>
            {">>"} {currentActivityIndex + 2}. {nextActivity.name}
          </>
        ) : (
          "\u00a0"
        )}
      </p>
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
        {/* Outer per-activity colored radial dashes */}
        <svg
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          aria-hidden
        >
          {activityTicks.map((tick) => {
            const outerPt = polar(center, center, tickMidRadius + TICK_LENGTH / 2, tick.angle);
            const innerPt = polar(center, center, tickMidRadius - TICK_LENGTH / 2, tick.angle);
            return (
              <line
                key={tick.key}
                x1={innerPt.x}
                y1={innerPt.y}
                x2={outerPt.x}
                y2={outerPt.y}
                stroke={tick.color}
                strokeOpacity={tick.opacity}
                strokeWidth={3.25}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Inner solid activity progress */}
        <div
          className="absolute inset-0 z-0 flex items-center justify-center"
          style={{ padding: inset }}
        >
          <ProgressRing
            radius={innerRadius}
            color={ringColor}
            progress={ringProgress}
            mode={ringMode}
            isPulsing={isPulsing}
            strokeTransition={false}
            className={`h-full w-full ${timerState === "finished" ? "motion-safe:animate-bounce-ring" : ""}`}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 py-8 text-center">
        {face}
      </div>
    </div>
  );
}
