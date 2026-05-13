"use client";

import { useEffect, useMemo } from "react";
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
const STROKE = 10;

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

function TimerRing({
  strokeOffset,
  circumference,
  progressStroke,
  showProgress,
  fullComplete,
}: {
  strokeOffset: number;
  circumference: number;
  progressStroke: string;
  showProgress: boolean;
  fullComplete: boolean;
}) {
  return (
    <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} aria-hidden>
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RING_RADIUS}
        fill="none"
        className="stroke-slate-700"
        strokeWidth={STROKE}
      />
      {fullComplete ? (
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke="#10b981"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={0}
        />
      ) : showProgress ? (
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke={progressStroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      ) : null}
    </svg>
  );
}

function TimerCardView2Countdown({ template }: { template: TimerTemplate }) {
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

  const hint =
    state === "idle"
      ? "Tap to start"
      : state === "running"
        ? "Tap to pause"
        : state === "paused"
          ? "Tap to resume"
          : "Tap to restart";

  const timeColor =
    state === "running"
      ? "text-emerald-400 motion-safe:animate-pulse"
      : state === "paused"
        ? "text-amber-300"
        : state === "finished"
          ? "text-emerald-400"
          : "text-slate-100";

  const showArc = state === "running" || state === "paused" || state === "finished";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleTap}
      onKeyDown={handleKeyToggle}
      className="cursor-pointer py-8 text-center outline-none transition motion-safe:hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      <div className="mb-2 text-4xl leading-none opacity-80" aria-hidden>
        {template.icon}
      </div>
      <p className="mb-6 truncate px-1 text-sm font-medium text-slate-400">{template.template_name}</p>

      <div className="relative mx-auto h-56 w-56">
        <TimerRing
          circumference={circumference}
          strokeOffset={strokeOffset}
          progressStroke={progressStroke}
          showProgress={showArc && state !== "finished"}
          fullComplete={state === "finished"}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2">
          {state === "finished" ? (
            <span className={`text-5xl font-bold tabular-nums ${timeColor}`}>DONE</span>
          ) : (
            <span className={`font-mono text-5xl font-bold tabular-nums ${timeColor}`}>
              {formatClock(timeRemaining)}
            </span>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function TimerCardView2Interval({ template }: { template: TimerTemplate }) {
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

  const hint =
    runState === "idle"
      ? "Tap to start"
      : runState === "running"
        ? "Tap to pause"
        : runState === "paused"
          ? "Tap to resume"
          : "Tap to restart";

  const timeColor =
    runState === "running" && phase === "work"
      ? "text-red-400 motion-safe:animate-pulse"
      : runState === "running" && phase === "rest"
        ? "text-emerald-400 motion-safe:animate-pulse"
        : runState === "paused"
          ? "text-amber-200"
          : runState === "finished"
            ? "text-emerald-400"
            : "text-slate-100";

  const roundLabel = `Round ${Math.min(displayRound, rounds)} / ${rounds}`;
  const showArc = runState === "running" || runState === "paused" || runState === "finished";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleTap}
      onKeyDown={handleKeyToggle}
      className="cursor-pointer py-8 text-center outline-none transition motion-safe:hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      <div className="mb-2 text-4xl leading-none opacity-80" aria-hidden>
        {template.icon}
      </div>
      <p className="mb-6 truncate px-1 text-sm font-medium text-slate-400">{template.template_name}</p>

      <div className="relative mx-auto h-56 w-56">
        <TimerRing
          circumference={circumference}
          strokeOffset={strokeOffset}
          progressStroke={progressStroke}
          showProgress={showArc && runState !== "finished"}
          fullComplete={runState === "finished"}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2">
          {runState === "finished" ? (
            <span className={`text-5xl font-bold tabular-nums ${timeColor}`}>DONE</span>
          ) : (
            <span className={`font-mono text-5xl font-bold tabular-nums ${timeColor}`}>
              {formatClock(timeRemaining)}
            </span>
          )}
          {runState !== "finished" && runState !== "idle" ? (
            <p className={`text-[11px] font-bold uppercase tracking-wide ${phase === "work" ? "text-red-400" : "text-emerald-400"}`}>
              {phase === "work" ? "Work" : "Rest"} · {roundLabel}
            </p>
          ) : null}
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-500">{hint}</p>
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
      <p className="text-xs text-slate-500">Tap to open this routine in the lab</p>
    </div>
  );
}
