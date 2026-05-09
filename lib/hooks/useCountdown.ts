"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type CountdownState = "idle" | "running" | "paused" | "finished";

type UseCountdownResult = {
  state: CountdownState;
  timeRemaining: number;
  progress: number;
  start: (durationInSeconds: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
};

function normalizeDuration(seconds: number): number {
  if (!Number.isFinite(seconds)) return 1;
  return Math.max(1, Math.floor(seconds));
}

export function useCountdown(initialDurationSeconds: number): UseCountdownResult {
  const normalizedInitial = useMemo(() => normalizeDuration(initialDurationSeconds), [initialDurationSeconds]);
  const [state, setState] = useState<CountdownState>("idle");
  const [timeRemaining, setTimeRemaining] = useState(normalizedInitial);
  const [duration, setDuration] = useState(normalizedInitial);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const progress = duration > 0 ? Math.min(1, Math.max(0, timeRemaining / duration)) : 0;

  const start = useCallback((durationInSeconds: number) => {
    const normalized = normalizeDuration(durationInSeconds);
    setDuration(normalized);
    setTimeRemaining(normalized);
    setState("running");
  }, []);

  const pause = useCallback(() => {
    setState((previous) => (previous === "running" ? "paused" : previous));
  }, []);

  const resume = useCallback(() => {
    setState((previous) => (previous === "paused" ? "running" : previous));
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setTimeRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (state !== "running") {
      clearTick();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((previous) => {
        if (previous <= 1) {
          setState("finished");
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return clearTick;
  }, [state, clearTick]);

  useEffect(() => clearTick, [clearTick]);

  return {
    state,
    timeRemaining,
    progress,
    start,
    pause,
    resume,
    reset,
  };
}
