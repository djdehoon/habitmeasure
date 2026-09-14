"use client";

const pillBase =
  "inline-flex items-center justify-center rounded-full font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const mainPill = `${pillBase} min-h-9 px-4 py-1.5 text-xs`;
const secondaryPill = `${pillBase} min-h-8 px-3 py-1 text-[11px]`;

export type IntervalControlState = "idle" | "waiting" | "running" | "paused" | "finished";

export type IntervalControlButtonsProps = {
  state: IntervalControlState;
  isStarting: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onDelayedStart: () => void;
};

function playLabel(state: IntervalControlState): string {
  if (state === "paused") return "Resume";
  if (state === "finished") return "Restart";
  return "Play";
}

export function IntervalControlButtons({
  state,
  isStarting,
  onPlay,
  onPause,
  onStop,
  onDelayedStart,
}: IntervalControlButtonsProps) {
  const playDisabled = isStarting || state === "running" || state === "waiting";
  const pauseInactive = state !== "running";
  const stopDisabled = state === "idle";
  const delayedStartDisabled = state === "running" || state === "waiting";

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={onPlay}
          disabled={playDisabled}
          className={`${mainPill} border border-teal-400/35 bg-teal-500/10 text-teal-200 hover:bg-teal-500/20`}
        >
          {playLabel(state)}
        </button>
        <button
          type="button"
          onClick={onPause}
          aria-disabled={pauseInactive}
          className={`${mainPill} border border-amber-400/35 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20 ${
            pauseInactive ? "cursor-not-allowed opacity-40" : ""
          }`}
        >
          Pause
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={stopDisabled}
          className={`${mainPill} border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10`}
        >
          Stop
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={onDelayedStart}
          disabled={delayedStartDisabled}
          className={`${secondaryPill} border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300`}
        >
          Delayed start
        </button>
      </div>
    </div>
  );
}
