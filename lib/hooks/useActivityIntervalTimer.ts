"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playIntervalPhaseChange } from "@/app/lib/sounds";
import type { IntervalActivity } from "@/lib/utils/intervalActivities";

export type ActivityIntervalRunState = "idle" | "running" | "paused" | "finished";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export type UseActivityIntervalTimerResult = {
  timerState: ActivityIntervalRunState;
  currentActivityIndex: number;
  /** Seconds elapsed in current activity (continuous). */
  elapsedTime: number;
  globalElapsedTime: number;
  /** Remaining fraction of current phase (1 = full, 0 = empty) — countdown-style drain. */
  phaseProgress: number;
  /** Whole seconds remaining in current activity (ceil). */
  timeRemaining: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

export function useActivityIntervalTimer(activitiesInput: IntervalActivity[]): UseActivityIntervalTimerResult {
  const activities = useMemo(
    () =>
      activitiesInput.map((activity) => ({
        ...activity,
        duration: Math.max(1, Math.floor(activity.duration)),
      })),
    [activitiesInput],
  );

  const [timerState, setTimerState] = useState<ActivityIntervalRunState>("idle");
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const stateRef = useRef(timerState);
  const indexRef = useRef(0);
  const endsAtRef = useRef<number | null>(null);
  const phaseTotalMsRef = useRef(1000);
  const remainingMsRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const activitiesRef = useRef(activities);
  const prevIndexForSoundRef = useRef(0);

  useEffect(() => {
    stateRef.current = timerState;
  }, [timerState]);

  useEffect(() => {
    activitiesRef.current = activities;
    // Reset when activity list identity changes
    endsAtRef.current = null;
    remainingMsRef.current = 0;
    phaseTotalMsRef.current = (activities[0]?.duration ?? 1) * 1000;
    indexRef.current = 0;
    prevIndexForSoundRef.current = 0;
    setTimerState("idle");
    setCurrentActivityIndex(0);
    setElapsedTime(0);
    setPhaseProgress(1);
    setTimeRemaining(activities[0]?.duration ?? 0);
  }, [activities]);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const applyPhaseSnapshot = useCallback((remainingMs: number, phaseTotalMs: number) => {
    const safePhase = Math.max(1, phaseTotalMs);
    const clamped = Math.max(0, remainingMs);
    remainingMsRef.current = clamped;
    const elapsedSec = (safePhase - clamped) / 1000;
    setElapsedTime(elapsedSec);
    setTimeRemaining(Math.max(0, Math.ceil(clamped / 1000)));
    setPhaseProgress(clamp01(clamped / safePhase));
  }, []);

  const beginActivity = useCallback(
    (index: number) => {
      const list = activitiesRef.current;
      const activity = list[index];
      if (!activity) {
        endsAtRef.current = null;
        remainingMsRef.current = 0;
        setTimerState("finished");
        setPhaseProgress(0);
        setElapsedTime(0);
        setTimeRemaining(0);
        stopRaf();
        return;
      }

      const totalMs = Math.max(1, activity.duration * 1000);
      phaseTotalMsRef.current = totalMs;
      remainingMsRef.current = totalMs;
      endsAtRef.current = Date.now() + totalMs;
      indexRef.current = index;
      setCurrentActivityIndex(index);
      setTimerState("running");
      applyPhaseSnapshot(totalMs, totalMs);

      if (index > 0 && prevIndexForSoundRef.current !== index) {
        playIntervalPhaseChange();
      }
      prevIndexForSoundRef.current = index;
    },
    [applyPhaseSnapshot, stopRaf],
  );

  const start = useCallback(() => {
    if (activitiesRef.current.length === 0) return;
    prevIndexForSoundRef.current = 0;
    beginActivity(0);
  }, [beginActivity]);

  const pause = useCallback(() => {
    setTimerState((previous) => {
      if (previous !== "running") return previous;
      if (endsAtRef.current !== null) {
        remainingMsRef.current = Math.max(0, endsAtRef.current - Date.now());
      }
      endsAtRef.current = null;
      applyPhaseSnapshot(remainingMsRef.current, phaseTotalMsRef.current);
      return "paused";
    });
  }, [applyPhaseSnapshot]);

  const resume = useCallback(() => {
    setTimerState((previous) => {
      if (previous !== "paused") return previous;
      const remaining = Math.max(0, remainingMsRef.current);
      endsAtRef.current = Date.now() + remaining;
      applyPhaseSnapshot(remaining, phaseTotalMsRef.current);
      return "running";
    });
  }, [applyPhaseSnapshot]);

  const stop = useCallback(() => {
    stopRaf();
    endsAtRef.current = null;
    remainingMsRef.current = 0;
    indexRef.current = 0;
    prevIndexForSoundRef.current = 0;
    phaseTotalMsRef.current = (activitiesRef.current[0]?.duration ?? 1) * 1000;
    setTimerState("idle");
    setCurrentActivityIndex(0);
    setElapsedTime(0);
    setPhaseProgress(1);
    setTimeRemaining(activitiesRef.current[0]?.duration ?? 0);
  }, [stopRaf]);

  useEffect(() => {
    if (timerState !== "running") {
      stopRaf();
      return;
    }

    const tick = () => {
      const endsAt = endsAtRef.current;
      if (endsAt === null) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const remainingMs = endsAt - Date.now();
      if (remainingMs <= 0) {
        const list = activitiesRef.current;
        const nextIndex = indexRef.current + 1;
        if (nextIndex >= list.length) {
          endsAtRef.current = null;
          remainingMsRef.current = 0;
          const last = list[list.length - 1];
          setElapsedTime(last?.duration ?? 0);
          setTimeRemaining(0);
          setPhaseProgress(0);
          setTimerState("finished");
          stopRaf();
          return;
        }
        beginActivity(nextIndex);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      applyPhaseSnapshot(remainingMs, phaseTotalMsRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return stopRaf;
  }, [timerState, stopRaf, beginActivity, applyPhaseSnapshot]);

  const globalElapsedTime = useMemo(() => {
    let total = 0;
    for (let i = 0; i < activities.length; i += 1) {
      if (i < currentActivityIndex) {
        total += activities[i].duration;
      } else if (i === currentActivityIndex) {
        total += elapsedTime;
        break;
      }
    }
    if (timerState === "finished") {
      return activities.reduce((sum, a) => sum + a.duration, 0);
    }
    return total;
  }, [activities, currentActivityIndex, timerState, elapsedTime]);

  return {
    timerState,
    currentActivityIndex,
    elapsedTime,
    globalElapsedTime,
    phaseProgress,
    timeRemaining,
    start,
    pause,
    resume,
    stop,
  };
}
