"use client";

import type { CountdownState } from "@/lib/hooks/useCountdown";
import type { AddTimeButtonValue } from "@/lib/utils/timerHelpers";

const pillBase =
  "inline-flex items-center justify-center rounded-full font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const mainPill = `${pillBase} min-h-9 px-4 py-1.5 text-xs`;

const secondaryPill = `${pillBase} min-h-8 px-3 py-1 text-[11px]`;

const pulseIfRunning = (active: boolean) =>
  active ? "animate-pulse-button transform-gpu" : "";

function addTimeLabel(value: AddTimeButtonValue): string {
  if (value === "1m") return "+1 min";
  return `+${value.replace("s", " sec")}`;
}

function playLabel(state: CountdownState): string {
  if (state === "paused") return "Resume";
  if (state === "finished") return "Restart";
  return "Play";
}

export type CountdownControlButtonsProps = {
  state: CountdownState;
  isStarting: boolean;
  quickButtons: AddTimeButtonValue[];
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onAddTime: (value: AddTimeButtonValue) => void;
  onDelayedStart: () => void;
};

export function CountdownControlButtons({
  state,
  isStarting,
  quickButtons,
  onPlay,
  onPause,
  onReset,
  onAddTime,
  onDelayedStart,
}: CountdownControlButtonsProps) {
  const playDisabled = isStarting || state === "running" || state === "waiting";
  const pauseDisabled = state !== "running";
  const resetDisabled = state === "idle";
  const addTimeDisabled = state !== "running" && state !== "paused";
  const delayedStartDisabled = state === "running" || state === "waiting";

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={onPlay}
          disabled={playDisabled}
          className={`${mainPill} border border-teal-400/35 bg-teal-500/10 text-teal-200 hover:bg-teal-500/20 ${pulseIfRunning(state === "running" && !playDisabled)}`}
        >
          {playLabel(state)}
        </button>
        <button
          type="button"
          onClick={onPause}
          disabled={pauseDisabled}
          className={`${mainPill} border border-amber-400/35 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20 ${pulseIfRunning(state === "running" && !pauseDisabled)}`}
        >
          Pause
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={resetDisabled}
          className={`${mainPill} border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 ${pulseIfRunning(state === "running" && !resetDisabled)}`}
        >
          Reset
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {quickButtons.map((value) => (
          <button
            key={value}
            type="button"
            disabled={addTimeDisabled}
            onClick={() => onAddTime(value)}
            className={`${secondaryPill} border border-teal-400/35 bg-teal-500/10 text-teal-200/90 hover:bg-teal-500/20 ${pulseIfRunning(state === "running" && !addTimeDisabled)}`}
          >
            {addTimeLabel(value)}
          </button>
        ))}
        <button
          type="button"
          onClick={onDelayedStart}
          disabled={delayedStartDisabled}
          className={`${secondaryPill} border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300 ${pulseIfRunning(state === "running" && !delayedStartDisabled)}`}
        >
          Delayed start
        </button>
      </div>
    </div>
  );
}
