import type { CountdownState } from "@/lib/hooks/useCountdown";

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function statusLabel(state: CountdownState): string | null {
  switch (state) {
    case "waiting":
      return "WAIT";
    case "paused":
      return "PAUSED";
    case "finished":
      return "DONE";
    default:
      return null;
  }
}

/** WAIT / PAUSED / DONE: status is primary in the ring; timer is secondary. */
export function isStatusFocusedRingDisplay(state: CountdownState): boolean {
  return state === "waiting" || state === "paused" || state === "finished";
}

/** @alias isStatusFocusedRingDisplay — ring layout uses smaller clock when WAIT/PAUSED/DONE. */
export const isCompactRingDisplay = isStatusFocusedRingDisplay;

const statusFocusedClockClassName =
  "font-sans font-semibold tabular-nums text-3xl text-slate-400";

const mainClockClassName =
  "font-sans font-semibold tabular-nums tracking-tight text-7xl sm:text-7xl";

export function ringClockClassName(state: CountdownState): string {
  if (isStatusFocusedRingDisplay(state)) {
    return statusFocusedClockClassName;
  }
  return mainClockClassName;
}

export function ringStatusClassName(state: CountdownState): string {
  return "text-3xl font-semibold uppercase tracking-wide text-sky-400 sm:text-4xl";
}
