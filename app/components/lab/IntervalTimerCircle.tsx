"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProgressRing } from "@/app/components/lab/ProgressRing";
import { countdownRingColumnWidth } from "@/app/components/lab/countdownPremiumStyles";
import {
  calculateActivityBlocks,
  formatActivitiesTotalDuration,
  type IntervalActivity,
} from "@/lib/utils/intervalActivities";
import type { ActivityIntervalRunState } from "@/lib/hooks/useActivityIntervalTimer";
import { formatClock } from "@/lib/utils/countdownFormat";

type IntervalTimerCircleProps = {
  activities: IntervalActivity[];
  currentActivityIndex: number;
  elapsedTime: number;
  globalElapsedTime: number;
  timerState: ActivityIntervalRunState;
};

const PAUSED_COLOR = "#FF8C00";
const FINISHED_COLOR = "#2196F3";

export function IntervalTimerCircle({
  activities,
  currentActivityIndex,
  elapsedTime,
  globalElapsedTime,
  timerState,
}: IntervalTimerCircleProps) {
  const ringContainerRef = useRef<HTMLDivElement>(null);
  const [ringRadius, setRingRadius] = useState(140);

  const currentActivity = activities[currentActivityIndex] ?? activities[0];
  const phaseDuration = currentActivity?.duration ?? 1;
  const phaseProgress =
    phaseDuration > 0 ? Math.min(1, Math.max(0, elapsedTime / phaseDuration)) : 0;
  const timeRemaining = Math.max(0, phaseDuration - elapsedTime);

  const blocks = useMemo(
    () => calculateActivityBlocks(activities, globalElapsedTime),
    [activities, globalElapsedTime],
  );

  const ringColor =
    timerState === "paused"
      ? PAUSED_COLOR
      : timerState === "finished"
        ? FINISHED_COLOR
        : currentActivity?.color ?? "#E74C3C";

  const ringMode = "partial" as const;
  const ringProgress =
    timerState === "idle" ? 0 : timerState === "finished" ? 1 : phaseProgress;

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

  return (
    <div className={`relative mx-auto aspect-square ${countdownRingColumnWidth}`}>
      <div
        ref={ringContainerRef}
        className={`absolute inset-0 ${timerState === "idle" ? "opacity-50" : timerState === "paused" ? "opacity-70" : ""}`}
      >
        <ProgressRing
          radius={ringRadius}
          color={ringColor}
          progress={ringProgress}
          mode={ringMode}
          isPulsing={isPulsing}
          className={`h-full w-full ${timerState === "finished" ? "motion-safe:animate-bounce-ring" : ""}`}
        />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-8 text-center">
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

        <div className="mt-2 h-px w-4/5 max-w-[14rem] bg-[#444444]" />

        <p className="mt-2 text-base text-white">
          {currentActivityIndex + 1}. {currentActivity.name}
        </p>
      </div>
    </div>
  );
}
