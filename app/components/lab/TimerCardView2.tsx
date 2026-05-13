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
const TRACK_STROKE = 2;
const PROGRESS_STROKE = 4;

const RING_FRAME_CLASS =
  "relative mx-auto aspect-square w-[min(100%,18rem)] max-w-[18rem] min-w-0";

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
        stroke={routineColor}
        strokeOpacity={0.3}
        strokeWidth={TRACK_STROKE}
      />
      {progressMode === "full" ? (
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke={routineColor}
          strokeWidth={PROGRESS_STROKE}
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
          strokeWidth={PROGRESS_STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      ) : null}
    </svg>
  );
}

/** Upper (time) / thin line / lower (icon + name + extras). Ultra-lean typography. */
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
    <div className="absolute inset-0 flex min-h-0 flex-col px-2 pt-0.5">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-end pb-1.5">{upperSlot}</div>
      {useNeutralLine ? (
        <div className="h-px w-16 shrink-0 self-center bg-slate-600/50" />
      ) : (
        <div className="h-px w-16 shrink-0 self-center" style={{ backgroundColor: lineColor, opacity: 0.4 }} />
      )}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-start px-1.5 pt-2">
        <p className="max-w-[min(100%,13.5rem)] text-center text-sm font-normal leading-snug break-words text-slate-300 [overflow-wrap:anywhere]">
          <span className="mr-1 inline select-none align-middle text-lg leading-none" aria-hidden>
            {template.icon}
          </span>
          {template.template_name}
        </p>
        {lowerExtra}
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
      <div className="flex items-center justify-center gap-2">
        <span className="font-mono text-xl font-light tabular-nums text-amber-300">{formatClock(timeRemaining)}</span>
        <span className="text-xs font-normal uppercase tracking-wide text-amber-400">Paused</span>
      </div>
    ) : state === "finished" ? (
      <span className="font-mono text-3xl font-light tabular-nums text-emerald-400">DONE</span>
    ) : (
      <span
        className={`font-mono text-4xl font-light tabular-nums ${
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
      <p className="mt-2 text-center text-xs font-normal text-emerald-400/90">Complete</p>
    ) : null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleTap}
      onKeyDown={handleKeyToggle}
      className="cursor-pointer py-8 text-center outline-none transition motion-safe:hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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
      <div className="flex items-center justify-center gap-2">
        <span className="font-mono text-xl font-light tabular-nums text-amber-300">{formatClock(timeRemaining)}</span>
        <span className="text-xs font-normal uppercase tracking-wide text-amber-400">Paused</span>
      </div>
    ) : runState === "finished" ? (
      <span className="font-mono text-3xl font-light tabular-nums text-emerald-400">DONE</span>
    ) : (
      <span
        className={`font-mono text-4xl font-light tabular-nums ${
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
          className={`mt-2 text-center text-xs font-normal opacity-70 ${phase === "work" ? "text-red-400" : "text-emerald-400"}`}
        >
          {phase === "work" ? "Work" : "Rest"} · {roundLabel}
        </p>
      ) : null}
      {runState === "finished" ? (
        <p className="mt-2 text-center text-xs font-normal text-emerald-400/90">{rounds} rounds complete</p>
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
      className="cursor-pointer py-8 text-center outline-none transition motion-safe:hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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
      className="cursor-pointer py-8 text-center outline-none transition motion-safe:hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      <div className="mb-2 text-4xl leading-none opacity-80" aria-hidden>
        {template.icon}
      </div>
      <p className="mb-2 truncate px-1 text-sm font-medium text-slate-400">{template.template_name}</p>
      <p className="text-xs font-light text-slate-500">Tap to open this routine in the lab</p>
    </div>
  );
}
