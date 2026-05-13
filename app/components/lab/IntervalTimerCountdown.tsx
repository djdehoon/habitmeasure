"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playPauseSound } from "@/app/lib/sounds";
import { createTimerSession, updateTimerSession } from "@/lib/hooks/useTimerSessions";
import { useIntervalTimer } from "@/lib/hooks/useIntervalTimer";

const WORK_COLOR = "#E74C3C";
const REST_COLOR = "#27AE60";

type IntervalTimerCountdownProps = {
  templateId: string;
  templateName: string;
  workSeconds: number;
  restSeconds: number;
  rounds: number;
};

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function IntervalTimerCountdown({
  templateId,
  templateName,
  workSeconds,
  restSeconds,
  rounds,
}: IntervalTimerCountdownProps) {
  const { runState, phase, timeRemaining, displayRound, progress, start, pause, resume, stop } =
    useIntervalTimer(workSeconds, restSeconds, rounds);

  const sessionIdRef = useRef<string | null>(null);
  const terminalSentRef = useRef(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const ringColor = phase === "work" ? WORK_COLOR : REST_COLOR;
  const phaseLabel = phase === "work" ? "WORK" : "REST";

  const radius = 80;
  const circumference = useMemo(() => 2 * Math.PI * radius, []);
  const strokeOffset = circumference * (1 - progress);

  useEffect(() => {
    if (runState !== "finished" || !sessionIdRef.current || terminalSentRef.current) {
      return;
    }

    let cancelled = false;
    void (async () => {
      const { error } = await updateTimerSession(sessionIdRef.current!, "completed");
      if (cancelled) return;
      if (error) {
        setSessionError(error);
        return;
      }
      terminalSentRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [runState]);

  const handleStart = useCallback(async () => {
    setSessionError(null);
    setIsStarting(true);
    try {
      const { data, error } = await createTimerSession(templateId);
      if (error || !data) {
        setSessionError(error ?? "Could not start session.");
        return;
      }
      sessionIdRef.current = data.session_id;
      terminalSentRef.current = false;
      start();
    } finally {
      setIsStarting(false);
    }
  }, [templateId, start]);

  const handlePause = useCallback(async () => {
    playPauseSound();
    if (sessionIdRef.current) {
      const { error } = await updateTimerSession(sessionIdRef.current, "paused");
      if (error) setSessionError(error);
    }
    pause();
  }, [pause]);

  const handleResume = useCallback(async () => {
    if (sessionIdRef.current) {
      const { error } = await updateTimerSession(sessionIdRef.current, "running");
      if (error) setSessionError(error);
    }
    resume();
  }, [resume]);

  const handleStopOrDismiss = useCallback(async () => {
    if (runState !== "finished" && sessionIdRef.current && !terminalSentRef.current) {
      const { error } = await updateTimerSession(sessionIdRef.current, "cancelled");
      if (error) setSessionError(error);
      terminalSentRef.current = true;
    }
    stop();
    sessionIdRef.current = null;
    terminalSentRef.current = false;
  }, [runState, stop]);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-white px-4 py-4 text-[#1A1A2E] md:py-6">
      <h1 className="heading-font text-center text-2xl font-bold md:text-3xl">{templateName}</h1>

      {sessionError ? (
        <p className="mt-2 max-w-md text-center text-sm text-[#E74C3C]" role="alert">
          {sessionError}
        </p>
      ) : null}

      <p className="mt-2 text-sm font-medium text-[#6B7280] md:text-base">
        Round {Math.min(displayRound, rounds)} / {rounds}
      </p>

      <p
        className="mt-3 text-2xl font-black tracking-wide md:text-3xl"
        style={{ color: ringColor }}
        aria-live="polite"
      >
        {phaseLabel}
      </p>

      <div className="relative mt-2 h-64 w-64 md:mt-3 md:h-72 md:w-72">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#F5F7FA" strokeWidth="8" />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="heading-font text-5xl font-black text-[#1A1A2E] md:text-6xl">
            {formatClock(timeRemaining)}
          </span>
        </div>
      </div>

      {runState === "finished" ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="interval-complete-title"
        >
          <div className="max-w-sm rounded-2xl bg-white px-8 py-10 text-center shadow-lg">
            <h2 id="interval-complete-title" className="heading-font text-2xl font-bold text-[#0C3D3A]">
              Routine Complete!
            </h2>
            <button
              type="button"
              onClick={() => void handleStopOrDismiss()}
              className="mt-6 rounded-full bg-[#27AE60] px-8 py-3 text-base font-semibold text-white transition hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {runState === "idle" ? (
          <button
            type="button"
            onClick={() => void handleStart()}
            disabled={isStarting}
            className="rounded-full px-8 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: WORK_COLOR }}
          >
            {isStarting ? "Starting…" : "▶ Start"}
          </button>
        ) : null}

        {runState === "running" ? (
          <button
            type="button"
            onClick={() => void handlePause()}
            className="rounded-full px-8 py-3 text-base font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: ringColor }}
          >
            ⏸ Pause
          </button>
        ) : null}

        {runState === "paused" ? (
          <button
            type="button"
            onClick={() => void handleResume()}
            className="rounded-full px-8 py-3 text-base font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: ringColor }}
          >
            ▶ Resume
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => void handleStopOrDismiss()}
          className="rounded-full bg-[#F5F7FA] px-8 py-3 text-base font-semibold text-[#1A1A2E] transition hover:bg-[#e9edf2]"
        >
          Stop
        </button>
      </div>
    </section>
  );
}
