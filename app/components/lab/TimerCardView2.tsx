"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { playFinishSound, playPauseSound, playStartSound } from "@/app/lib/sounds";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { useIntervalTimer } from "@/lib/hooks/useIntervalTimer";
import type { TimerTemplate } from "@/lib/utils/timerHelpers";

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function hasValidIntervalFields(t: TimerTemplate): boolean {
  if (t.timer_type !== "interval") return false;
  const work = Number(t.work_seconds);
  const rest = Number(t.rest_seconds);
  const rounds = Number(t.rounds);
  return (
    Number.isFinite(work) &&
    work > 0 &&
    Number.isFinite(rest) &&
    rest > 0 &&
    Number.isFinite(rounds) &&
    rounds > 0
  );
}

const RING_RADIUS = 56;
const VIEWBOX = 160;
const CENTER = VIEWBOX / 2;
/** Neutral stopwatch-style track (always full). */
const STOPWATCH_BACK_STROKE = 6;
/** Colored progress arc / idle fill; same width as track for layered stopwatch look. */
const STOPWATCH_PROGRESS_STROKE = 6;
const STOPWATCH_BACK_COLOR = "#333333";
const STOPWATCH_BACK_OPACITY = 0.5;

const RING_FRAME_CLASS =
  "relative mx-auto aspect-square w-full min-w-0 max-w-44 overflow-hidden rounded-full sm:max-w-52 md:max-w-60 lg:max-w-72";

const VIEW2_CARD_PY = "py-0 sm:py-3 md:py-5 lg:py-7";

const VIEW2_TIME_TEXT =
  "font-mono font-light tabular-nums text-xl sm:text-2xl md:text-3xl lg:text-4xl";

const VIEW2_DONE_TEXT =
  "font-mono font-light tabular-nums text-2xl sm:text-3xl md:text-3xl lg:text-4xl";

const VIEW2_PAUSED_TIME_TEXT =
  "font-mono font-light tabular-nums text-lg sm:text-xl md:text-xl lg:text-2xl";

const VIEW2_CARD_FOCUS =
  "cursor-pointer text-center outline-none transition motion-safe:hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

type TimerCardView2Props = {
  template: TimerTemplate;
};

export function TimerCardView2({ template }: TimerCardView2Props) {
  if (template.timer_type === "countdown") {
    return <TimerCardView2Countdown template={template} />;
  }
  if (hasValidIntervalFields(template)) {
    return <TimerCardView2Interval template={template} />;
  }
  return <TimerCardView2Fallback template={template} />;
}

type RingProgressMode = "none" | "full" | "partial";

function TimerRing({
  strokeOffset,
  circumference,
  routineColor,
  progressStroke,
  progressMode,
}: {
  strokeOffset: number;
  circumference: number;
  routineColor: string;
  progressStroke: string;
  progressMode: RingProgressMode;
}) {
  return (
    <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} aria-hidden>
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RING_RADIUS}
        fill="none"
        stroke={STOPWATCH_BACK_COLOR}
        strokeOpacity={STOPWATCH_BACK_OPACITY}
        strokeWidth={STOPWATCH_BACK_STROKE}
      />
      {progressMode === "full" ? (
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke={routineColor}
          strokeWidth={STOPWATCH_PROGRESS_STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={0}
        />
      ) : progressMode === "partial" ? (
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke={progressStroke}
          strokeWidth={STOPWATCH_PROGRESS_STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      ) : null}
    </svg>
  );
}

/** Time / thin line / name + extras / icon at bottom. Ultra-lean typography. */
function View2UltraLeanFace({
  template,
  lineColor,
  useNeutralLine,
  upperSlot,
  lowerExtra,
}: {
  template: TimerTemplate;
  lineColor: string;
  useNeutralLine: boolean;
  upperSlot: ReactNode;
  lowerExtra?: ReactNode;
}) {
  return (
    <div className="absolute inset-0 flex min-h-0 min-w-0 flex-col px-0.5 pt-0 pb-0.5 sm:px-0.5 sm:pt-0.5 sm:pb-2">
      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col items-center justify-end pb-0 pt-0 sm:pb-1.5 sm:pt-0">
        {upperSlot}
      </div>
      {useNeutralLine ? (
        <div className="h-px w-16 shrink-0 self-center bg-white/30" />
      ) : (
        <div className="h-px w-16 shrink-0 self-center" style={{ backgroundColor: lineColor, opacity: 0.55 }} />
      )}
      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col items-stretch justify-between pt-0.5 pb-0 sm:pt-2 sm:pb-1">
        <div className="flex min-w-0 shrink-0 flex-col items-stretch">
          <p className="w-full min-w-0 max-w-full self-stretch text-balance text-center text-xs font-normal leading-snug break-words text-slate-300 [overflow-wrap:anywhere] sm:text-sm">
            {template.template_name}
            
          </p>
          {lowerExtra}
        </div>
        <div className="w-full text-center">
  <span className="shrink-0 text-2xl leading-none">{template.icon}</span>
    </div>
        <span
          className="mt-0 shrink-0 self-center select-none text-xl leading-none sm:mt-20 sm:text-2xl md:text-2xl lg:text-3xl"
          aria-hidden>
        </span>
      </div>
    </div>
  );
}

function TimerCardView2Countdown({ template }: { template: TimerTemplate }) {
  const routineColor = template.color?.trim() || "#00E5C0";
  const durationSeconds = Math.max(1, Math.floor(Number(template.duration_seconds)));
  const { state, timeRemaining, progress, start, pause, resume } = useCountdown(durationSeconds);
  const circumference = useMemo(() => 2 * Math.PI * RING_RADIUS, []);
  const strokeOffset = circumference * (1 - progress);

  useEffect(() => {
    if (state === "finished") {
      playFinishSound();
    }
  }, [state]);

  const handleTap = () => {
    if (state === "idle") {
      playStartSound();
      start(durationSeconds);
    } else if (state === "running") {
      playPauseSound();
      pause();
    } else if (state === "paused") {
      playStartSound();
      resume();
    } else if (state === "finished") {
      playStartSound();
      start(durationSeconds);
    }
  };

  const handleKeyToggle = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTap();
    }
  };

  const ariaLabel =
    state === "idle"
      ? `Start timer for ${template.template_name}`
      : state === "running"
        ? `Pause timer for ${template.template_name}`
        : state === "paused"
          ? `Resume timer for ${template.template_name}`
          : `Restart timer for ${template.template_name}`;

  const progressStroke =
    state === "paused" ? "#fbbf24" : state === "finished" ? "#10b981" : "#34d399";

  const ringProgressMode: RingProgressMode =
    state === "idle" ? "full" : state === "finished" ? "none" : "partial";

  const upperSlot =
    state === "paused" ? (
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
        <span className={`${VIEW2_PAUSED_TIME_TEXT} text-amber-300`}>{formatClock(timeRemaining)}</span>
        <span className="text-xs font-normal uppercase tracking-wide text-amber-400">Paused</span>
      </div>
    ) : state === "finished" ? (
      <span className={`${VIEW2_DONE_TEXT} text-emerald-400`}>DONE</span>
    ) : (
      <span
        className={`${VIEW2_TIME_TEXT} ${
          state === "running"
            ? "text-emerald-400 motion-safe:animate-pulse"
            : "text-slate-100"
        }`}
      >
        {formatClock(timeRemaining)}
      </span>
    );

  const lowerExtra =
    state === "finished" ? (
      <p className="mt-0.5 max-w-full min-w-0 text-center text-xs font-normal text-emerald-400/90 sm:mt-2">Complete</p>
    ) : null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleTap}
      onKeyDown={handleKeyToggle}
      className={`${VIEW2_CARD_FOCUS} ${VIEW2_CARD_PY}`}
    >
      <div className={RING_FRAME_CLASS}>
        <TimerRing
          circumference={circumference}
          strokeOffset={strokeOffset}
          routineColor={routineColor}
          progressStroke={progressStroke}
          progressMode={ringProgressMode}
        />
        <View2UltraLeanFace
          template={template}
          lineColor={progressStroke}
          useNeutralLine={state === "idle"}
          upperSlot={upperSlot}
          lowerExtra={lowerExtra}
        />
      </div>
    </div>
  );
}

function TimerCardView2Interval({ template }: { template: TimerTemplate }) {
  const routineColor = template.color?.trim() || "#00E5C0";
  const work = Math.max(1, Math.floor(Number(template.work_seconds)));
  const rest = Math.max(1, Math.floor(Number(template.rest_seconds)));
  const rounds = Math.max(1, Math.floor(Number(template.rounds)));

  const { runState, phase, timeRemaining, displayRound, progress, start, pause, resume } =
    useIntervalTimer(work, rest, rounds);

  const circumference = useMemo(() => 2 * Math.PI * RING_RADIUS, []);
  const strokeOffset = circumference * (1 - progress);

  const handleTap = () => {
    if (runState === "idle") {
      playStartSound();
      start();
    } else if (runState === "running") {
      playPauseSound();
      pause();
    } else if (runState === "paused") {
      playStartSound();
      resume();
    } else if (runState === "finished") {
      playStartSound();
      start();
    }
  };

  const handleKeyToggle = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTap();
    }
  };

  const ariaLabel =
    runState === "idle"
      ? `Start interval for ${template.template_name}`
      : runState === "running"
        ? `Pause interval for ${template.template_name}`
        : runState === "paused"
          ? `Resume interval for ${template.template_name}`
          : `Restart interval for ${template.template_name}`;

  const progressStroke =
    runState === "paused"
      ? "#fbbf24"
      : runState === "finished"
        ? "#10b981"
        : phase === "work"
          ? "#ef4444"
          : "#22c55e";

  const ringProgressMode: RingProgressMode =
    runState === "idle" ? "full" : runState === "finished" ? "none" : "partial";

  const roundLabel = `${Math.min(displayRound, rounds)}/${rounds}`;

  const upperSlot =
    runState === "paused" ? (
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
        <span className={`${VIEW2_PAUSED_TIME_TEXT} text-amber-300`}>{formatClock(timeRemaining)}</span>
        <span className="text-xs font-normal uppercase tracking-wide text-amber-400">Paused</span>
      </div>
    ) : runState === "finished" ? (
      <span className={`${VIEW2_DONE_TEXT} text-emerald-400`}>DONE</span>
    ) : (
      <span
        className={`${VIEW2_TIME_TEXT} ${
          runState === "running" && phase === "work"
            ? "text-red-400 motion-safe:animate-pulse"
            : runState === "running" && phase === "rest"
              ? "text-emerald-400 motion-safe:animate-pulse"
              : "text-slate-100"
        }`}
      >
        {formatClock(timeRemaining)}
      </span>
    );

  const lowerExtra = (
    <>
      {runState === "running" ? (
        <p
          className={`mt-0.5 max-w-full min-w-0 text-center text-xs font-normal opacity-70 sm:mt-2 ${phase === "work" ? "text-red-400" : "text-emerald-400"}`}
        >
          {phase === "work" ? "Work" : "Rest"} · {roundLabel}
        </p>
      ) : null}
      {runState === "finished" ? (
        <p className="mt-0.5 max-w-full min-w-0 text-center text-xs font-normal text-emerald-400/90 sm:mt-2">{rounds} rounds complete</p>
      ) : null}
    </>
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleTap}
      onKeyDown={handleKeyToggle}
      className={`${VIEW2_CARD_FOCUS} ${VIEW2_CARD_PY}`}
    >
      <div className={RING_FRAME_CLASS}>
        <TimerRing
          circumference={circumference}
          strokeOffset={strokeOffset}
          routineColor={routineColor}
          progressStroke={progressStroke}
          progressMode={ringProgressMode}
        />
        <View2UltraLeanFace
          template={template}
          lineColor={progressStroke}
          useNeutralLine={runState === "idle"}
          upperSlot={upperSlot}
          lowerExtra={lowerExtra}
        />
      </div>
    </div>
  );
}

function TimerCardView2Fallback({ template }: { template: TimerTemplate }) {
  const router = useRouter();
  const go = () => router.push(`/lab/${template.id}`);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open routine ${template.template_name}`}
      onClick={go}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          go();
        }
      }}
      className={`${VIEW2_CARD_FOCUS} ${VIEW2_CARD_PY}`}
    >
      <div className="mb-2 text-4xl leading-none opacity-80" aria-hidden>
        {template.icon}
      </div>
      <p className="mb-2 min-w-0 break-words px-1 text-center text-sm font-medium text-balance text-slate-400 [overflow-wrap:anywhere]">
        {template.template_name}
      </p>
      <p className="text-xs font-light text-slate-500">Tap to open this routine in the lab</p>
    </div>
  );
}
