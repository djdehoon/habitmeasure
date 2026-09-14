"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { playIntervalComplete, playIntervalPhaseChange } from "@/app/lib/sounds";
import type { IntervalActivity } from "@/lib/utils/intervalActivities";

export type ActivityIntervalRunState = "idle" | "running" | "paused" | "finished";

type MachineState = {
  runState: ActivityIntervalRunState;
  currentActivityIndex: number;
  elapsedTime: number;
};

type MachineAction =
  | { type: "START" }
  | { type: "TICK" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "STOP" }
  | { type: "RESET_ACTIVITIES" };

function initialState(): MachineState {
  return { runState: "idle", currentActivityIndex: 0, elapsedTime: 0 };
}

function reducer(
  state: MachineState,
  action: MachineAction,
  activities: IntervalActivity[],
): MachineState {
  switch (action.type) {
    case "RESET_ACTIVITIES":
      return initialState();
    case "START":
      if (activities.length === 0) return state;
      return { runState: "running", currentActivityIndex: 0, elapsedTime: 0 };
    case "STOP":
      return initialState();
    case "PAUSE":
      return state.runState === "running" ? { ...state, runState: "paused" } : state;
    case "RESUME":
      return state.runState === "paused" ? { ...state, runState: "running" } : state;
    case "TICK": {
      if (state.runState !== "running" || activities.length === 0) return state;
      const current = activities[state.currentActivityIndex];
      if (!current) return { ...state, runState: "finished", elapsedTime: 0 };

      if (state.elapsedTime + 1 < current.duration) {
        return { ...state, elapsedTime: state.elapsedTime + 1 };
      }

      const nextIndex = state.currentActivityIndex + 1;
      if (nextIndex >= activities.length) {
        return { runState: "finished", currentActivityIndex: activities.length - 1, elapsedTime: current.duration };
      }

      return { runState: "running", currentActivityIndex: nextIndex, elapsedTime: 0 };
    }
    default:
      return state;
  }
}

export type UseActivityIntervalTimerResult = {
  timerState: ActivityIntervalRunState;
  currentActivityIndex: number;
  elapsedTime: number;
  globalElapsedTime: number;
  phaseProgress: number;
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

  const activityReducer = useCallback(
    (state: MachineState, action: MachineAction) => reducer(state, action, activities),
    [activities],
  );

  const [state, dispatch] = useReducer(activityReducer, undefined, initialState);
  const prevIndex = useRef(state.currentActivityIndex);
  const prevRunState = useRef(state.runState);

  useEffect(() => {
    dispatch({ type: "RESET_ACTIVITIES" });
  }, [activities]);

  useEffect(() => {
    if (state.runState !== "running") {
      prevIndex.current = state.currentActivityIndex;
      return;
    }
    if (prevIndex.current !== state.currentActivityIndex) {
      playIntervalPhaseChange();
    }
    prevIndex.current = state.currentActivityIndex;
  }, [state.currentActivityIndex, state.runState]);

  useEffect(() => {
    if (prevRunState.current !== "finished" && state.runState === "finished") {
      playIntervalComplete();
    }
    prevRunState.current = state.runState;
  }, [state.runState]);

  useEffect(() => {
    if (state.runState !== "running") return;
    const id = window.setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => window.clearInterval(id);
  }, [state.runState]);

  const currentActivity = activities[state.currentActivityIndex];
  const phaseDuration = currentActivity?.duration ?? 1;
  const elapsedTime = state.runState === "finished" && currentActivity ? phaseDuration : state.elapsedTime;
  const phaseProgress =
    phaseDuration > 0 ? Math.min(1, Math.max(0, elapsedTime / phaseDuration)) : 0;
  const timeRemaining = Math.max(0, phaseDuration - elapsedTime);

  const globalElapsedTime = useMemo(() => {
    let total = 0;
    for (let i = 0; i < activities.length; i += 1) {
      if (i < state.currentActivityIndex) {
        total += activities[i].duration;
      } else if (i === state.currentActivityIndex) {
        total += elapsedTime;
        break;
      }
    }
    if (state.runState === "finished") {
      return activities.reduce((sum, a) => sum + a.duration, 0);
    }
    return total;
  }, [activities, state.currentActivityIndex, state.runState, elapsedTime]);

  const start = useCallback(() => dispatch({ type: "START" }), []);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const resume = useCallback(() => dispatch({ type: "RESUME" }), []);
  const stop = useCallback(() => dispatch({ type: "STOP" }), []);

  return {
    timerState: state.runState,
    currentActivityIndex: state.currentActivityIndex,
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
