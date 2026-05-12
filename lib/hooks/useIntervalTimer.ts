"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { playIntervalComplete, playIntervalPhaseChange } from "@/app/lib/sounds";

export type IntervalRunState = "idle" | "running" | "paused" | "finished";

export type IntervalPhase = "work" | "rest";

type IntervalMachineState = {
  runState: IntervalRunState;
  phase: IntervalPhase;
  currentRound: number;
  timeRemaining: number;
};

type IntervalAction =
  | { type: "START" }
  | { type: "TICK" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "STOP" }
  | { type: "RESET_CONFIG"; workSeconds: number };

function normalizePositiveInt(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value));
}

function initialMachine(workSeconds: number): IntervalMachineState {
  return {
    runState: "idle",
    phase: "work",
    currentRound: 1,
    timeRemaining: workSeconds,
  };
}

function intervalReducer(
  state: IntervalMachineState,
  action: IntervalAction,
  workSeconds: number,
  restSeconds: number,
  rounds: number,
): IntervalMachineState {
  switch (action.type) {
    case "RESET_CONFIG":
      return initialMachine(action.workSeconds);
    case "START":
      return { runState: "running", phase: "work", currentRound: 1, timeRemaining: workSeconds };
    case "STOP":
      return initialMachine(workSeconds);
    case "PAUSE":
      return state.runState === "running" ? { ...state, runState: "paused" } : state;
    case "RESUME":
      return state.runState === "paused" ? { ...state, runState: "running" } : state;
    case "TICK": {
      if (state.runState !== "running") return state;
      if (state.timeRemaining > 1) {
        return { ...state, timeRemaining: state.timeRemaining - 1 };
      }
      if (state.phase === "work") {
        if (state.currentRound < rounds) {
          return { ...state, phase: "rest", timeRemaining: restSeconds };
        }
        return { ...state, runState: "finished", timeRemaining: 0 };
      }
      return {
        ...state,
        phase: "work",
        currentRound: state.currentRound + 1,
        timeRemaining: workSeconds,
      };
    }
    default:
      return state;
  }
}

export type UseIntervalTimerResult = {
  runState: IntervalRunState;
  phase: IntervalPhase;
  currentRound: number;
  timeRemaining: number;
  displayRound: number;
  progress: number;
  phaseTotalSeconds: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

export function useIntervalTimer(
  workSecondsInput: number,
  restSecondsInput: number,
  roundsInput: number,
): UseIntervalTimerResult {
  const workSeconds = useMemo(
    () => normalizePositiveInt(workSecondsInput, 20),
    [workSecondsInput],
  );
  const restSeconds = useMemo(
    () => normalizePositiveInt(restSecondsInput, 10),
    [restSecondsInput],
  );
  const rounds = useMemo(() => normalizePositiveInt(roundsInput, 1), [roundsInput]);

  const reducer = useCallback(
    (state: IntervalMachineState, action: IntervalAction) =>
      intervalReducer(state, action, workSeconds, restSeconds, rounds),
    [workSeconds, restSeconds, rounds],
  );

  const [state, dispatch] = useReducer(reducer, workSeconds, initialMachine);

  const prevPhase = useRef<IntervalPhase>(state.phase);
  const prevRunState = useRef<IntervalRunState>(state.runState);

  useEffect(() => {
    dispatch({ type: "RESET_CONFIG", workSeconds });
  }, [workSeconds, restSeconds, rounds]);

  useEffect(() => {
    if (state.runState !== "running") {
      prevPhase.current = state.phase;
      return;
    }
    if (prevPhase.current === "work" && state.phase === "rest") {
      playIntervalPhaseChange();
    } else if (prevPhase.current === "rest" && state.phase === "work") {
      playIntervalPhaseChange();
    }
    prevPhase.current = state.phase;
  }, [state.phase, state.runState]);

  useEffect(() => {
    if (prevRunState.current !== "finished" && state.runState === "finished") {
      playIntervalComplete();
    }
    prevRunState.current = state.runState;
  }, [state.runState]);

  useEffect(() => {
    if (state.runState !== "running") return;

    const id = window.setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => window.clearInterval(id);
  }, [state.runState]);

  const phaseTotalSeconds = state.phase === "work" ? workSeconds : restSeconds;
  const progress =
    phaseTotalSeconds > 0 ? Math.min(1, Math.max(0, state.timeRemaining / phaseTotalSeconds)) : 0;

  const displayRound = state.phase === "work" ? state.currentRound : state.currentRound + 1;

  const start = useCallback(() => {
    dispatch({ type: "START" });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: "PAUSE" });
  }, []);

  const resume = useCallback(() => {
    dispatch({ type: "RESUME" });
  }, []);

  const stop = useCallback(() => {
    dispatch({ type: "STOP" });
  }, []);

  return {
    runState: state.runState,
    phase: state.phase,
    currentRound: state.currentRound,
    timeRemaining: state.timeRemaining,
    displayRound,
    progress,
    phaseTotalSeconds,
    start,
    pause,
    resume,
    stop,
  };
}
