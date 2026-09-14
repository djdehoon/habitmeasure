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

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function useCountdown(initialDurationSeconds: number): UseCountdownResult {
  const normalizedInitial = useMemo(
    () => normalizeDuration(initialDurationSeconds),
    [initialDurationSeconds],
  );

  const [state, setState] = useState<CountdownState>("idle");
  const [timeRemaining, setTimeRemaining] = useState(normalizedInitial);
  const [duration, setDuration] = useState(normalizedInitial);
  const [progress, setProgress] = useState(1);

  const stateRef = useRef<CountdownState>(state);
  const durationRef = useRef(duration);
  const endsAtRef = useRef<number | null>(null);
  const phaseTotalMsRef = useRef(normalizedInitial * 1000);
  const remainingMsRef = useRef(normalizedInitial * 1000);
  const rafRef = useRef<number | null>(null);
  const wholeSecondsRef = useRef(normalizedInitial);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const applySnapshot = useCallback((remainingMs: number, phaseTotalMs: number) => {
    const safePhase = Math.max(1, phaseTotalMs);
    const clampedMs = Math.max(0, remainingMs);
    remainingMsRef.current = clampedMs;
    const nextSeconds = Math.max(0, Math.ceil(clampedMs / 1000));
    if (nextSeconds !== wholeSecondsRef.current) {
      wholeSecondsRef.current = nextSeconds;
      setTimeRemaining(nextSeconds);
    }
    setProgress(clamp01(clampedMs / safePhase));
  }, []);

  const beginPhase = useCallback(
    (nextState: "waiting" | "running", totalSeconds: number) => {
      const totalMs = Math.max(1, Math.floor(totalSeconds) * 1000);
      phaseTotalMsRef.current = totalMs;
      remainingMsRef.current = totalMs;
      endsAtRef.current = Date.now() + totalMs;
      wholeSecondsRef.current = -1;
      setState(nextState);
      applySnapshot(totalMs, totalMs);
    },
    [applySnapshot],
  );

  const start = useCallback(
    (durationInSeconds: number, delaySeconds = 0) => {
      const normalized = normalizeDuration(durationInSeconds);
      const delay = normalizeDelay(delaySeconds);
      setDuration(normalized);
      durationRef.current = normalized;

      if (delay > 0) {
        beginPhase("waiting", delay);
      } else {
        beginPhase("running", normalized);
      }
    },
    [beginPhase],
  );

  const startWithDelay = useCallback(
    (delaySeconds: number) => {
      const normalized = normalizeDuration(durationRef.current);
      const delay = normalizeDelay(delaySeconds);
      setDuration(normalized);
      if (delay > 0) {
        beginPhase("waiting", delay);
      } else {
        beginPhase("running", normalized);
      }
    },
    [beginPhase],
  );

  const pause = useCallback(() => {
    setState((previous) => {
      if (previous !== "running") return previous;
      if (endsAtRef.current !== null) {
        remainingMsRef.current = Math.max(0, endsAtRef.current - Date.now());
      }
      endsAtRef.current = null;
      applySnapshot(remainingMsRef.current, phaseTotalMsRef.current);
      return "paused";
    });
  }, [applySnapshot]);

  const resume = useCallback(() => {
    setState((previous) => {
      if (previous !== "paused") return previous;
      const remaining = Math.max(0, remainingMsRef.current);
      endsAtRef.current = Date.now() + remaining;
      applySnapshot(remaining, phaseTotalMsRef.current);
      return "running";
    });
  }, [applySnapshot]);

  const reset = useCallback(() => {
    stopRaf();
    endsAtRef.current = null;
    phaseTotalMsRef.current = normalizedInitial * 1000;
    remainingMsRef.current = normalizedInitial * 1000;
    wholeSecondsRef.current = normalizedInitial;
    setState("idle");
    setDuration(normalizedInitial);
    durationRef.current = normalizedInitial;
    setTimeRemaining(normalizedInitial);
    setProgress(1);
  }, [stopRaf, normalizedInitial]);

  const addTime = useCallback(
    (seconds: number) => {
      const delta = Math.max(0, Math.floor(seconds));
      if (delta === 0) return;
      const current = stateRef.current;
      if (current !== "running" && current !== "paused") return;

      const deltaMs = delta * 1000;
      const baseRemaining =
        current === "running" && endsAtRef.current !== null
          ? Math.max(0, endsAtRef.current - Date.now())
          : Math.max(0, remainingMsRef.current);
      const nextRemaining = Math.min(5999_000, baseRemaining + deltaMs);
      const nextDurationSec = clampDuration(
        Math.max(durationRef.current, Math.ceil(nextRemaining / 1000)),
      );

      setDuration(nextDurationSec);
      durationRef.current = nextDurationSec;
      phaseTotalMsRef.current = nextDurationSec * 1000;
      remainingMsRef.current = nextRemaining;

      if (current === "running") {
        endsAtRef.current = Date.now() + nextRemaining;
      }
      applySnapshot(nextRemaining, phaseTotalMsRef.current);
    },
    [applySnapshot],
  );

  useEffect(() => {
    if (state !== "running" && state !== "waiting") {
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
        if (stateRef.current === "waiting") {
          beginPhase("running", durationRef.current);
          return;
        }
        endsAtRef.current = null;
        remainingMsRef.current = 0;
        wholeSecondsRef.current = 0;
        setTimeRemaining(0);
        setProgress(0);
        setState("finished");
        stopRaf();
        return;
      }

      applySnapshot(remainingMs, phaseTotalMsRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return stopRaf;
  }, [state, stopRaf, beginPhase, applySnapshot]);

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
