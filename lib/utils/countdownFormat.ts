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

/** WAIT / PAUSED: status is primary in the ring; timer is secondary. */
export function isStatusFocusedRingDisplay(state: CountdownState): boolean {
  return state === "waiting" || state === "paused";
}

/** @alias isStatusFocusedRingDisplay — ring layout uses smaller clock when WAIT/PAUSED. */
export const isCompactRingDisplay = isStatusFocusedRingDisplay;

export function ringClockClassName(state: CountdownState): string {
  if (isStatusFocusedRingDisplay(state)) {
    return "font-mono font-light tabular-nums text-base text-slate-400 sm:text-lg";
  }
  if (state === "finished") {
    return "font-mono font-light tabular-nums tracking-tight text-7xl md:text-7xl";
  }
  return "font-mono font-light tabular-nums tracking-tight text-7xl md:text-7xl";
}

export function ringStatusClassName(state: CountdownState): string {
  if (isStatusFocusedRingDisplay(state)) {
    return "text-3xl font-semibold uppercase tracking-wide text-sky-400 sm:text-4xl";
  }
  return "text-2xl font-semibold uppercase tracking-wide text-sky-400 md:text-3xl";
}
