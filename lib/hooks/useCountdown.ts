"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clampDuration } from "@/lib/utils/timerHelpers";

export type CountdownState = "idle" | "waiting" | "running" | "paused" | "finished";

type UseCountdownResult = {
  state: CountdownState;
  timeRemaining: number;
  duration: number;
  progress: number;
  start: (durationInSeconds: number, delaySeconds?: number) => void;
  startWithDelay: (delaySeconds: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  addTime: (seconds: number) => void;
};

function normalizeDuration(seconds: number): number {
  if (!Number.isFinite(seconds)) return 1;
  return clampDuration(seconds);
}

function normalizeDelay(seconds: number): number {
  if (!Number.isFinite(seconds)) return 0;
  return Math.max(0, Math.floor(seconds));
}

export function useCountdown(initialDurationSeconds: number): UseCountdownResult {
  const normalizedInitial = useMemo(() => normalizeDuration(initialDurationSeconds), [initialDurationSeconds]);
  const [state, setState] = useState<CountdownState>("idle");
  const [timeRemaining, setTimeRemaining] = useState(normalizedInitial);
  const [duration, setDuration] = useState(normalizedInitial);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef<CountdownState>(state);
  const durationRef = useRef(duration);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const progress =
    state === "waiting"
      ? 1
      : duration > 0
        ? Math.min(1, Math.max(0, timeRemaining / duration))
        : 0;

  const start = useCallback((durationInSeconds: number, delaySeconds = 0) => {
    const normalized = normalizeDuration(durationInSeconds);
    const delay = normalizeDelay(delaySeconds);
    setDuration(normalized);

    if (delay > 0) {
      setTimeRemaining(delay);
      setState("waiting");
    } else {
      setTimeRemaining(normalized);
      setState("running");
    }
  }, []);

  const startWithDelay = useCallback(
    (delaySeconds: number) => {
      const normalized = normalizeDuration(duration);
      const delay = normalizeDelay(delaySeconds);
      setDuration(normalized);
      setTimeRemaining(delay > 0 ? delay : normalized);
      setState(delay > 0 ? "waiting" : "running");
    },
    [duration],
  );

  const pause = useCallback(() => {
    setState((previous) => (previous === "running" ? "paused" : previous));
  }, []);

  const resume = useCallback(() => {
    setState((previous) => (previous === "paused" ? "running" : previous));
  }, []);

  const reset = useCallback(() => {
    clearTick();
    setState("idle");
    setDuration(normalizedInitial);
    setTimeRemaining(normalizedInitial);
  }, [clearTick, normalizedInitial]);

  const addTime = useCallback((seconds: number) => {
    const delta = Math.max(0, Math.floor(seconds));
    if (delta === 0) return;

    setTimeRemaining((previous) => {
      const current = stateRef.current;
      if (current !== "running" && current !== "paused") return previous;
      const next = clampDuration(previous + delta);
      setDuration((d) => clampDuration(Math.max(d, next)));
      return next;
    });
  }, []);

  useEffect(() => {
    if (state !== "running" && state !== "waiting") {
      clearTick();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((previous) => {
        const current = stateRef.current;
        if (previous <= 1) {
          if (current === "waiting") {
            setState("running");
            return durationRef.current;
          }
          setState("finished");
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return clearTick;
  }, [state, clearTick, duration]);

  useEffect(() => clearTick, [clearTick]);

  return {
    state,
    timeRemaining,
    duration,
    progress,
    start,
    startWithDelay,
    pause,
    resume,
    reset,
    addTime,
  };
}
