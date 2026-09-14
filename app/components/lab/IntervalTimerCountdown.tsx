"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IntervalTimerCircle } from "@/app/components/lab/IntervalTimerCircle";
import { playPauseSound } from "@/app/lib/sounds";
import { createTimerSession, updateTimerSession } from "@/lib/hooks/useTimerSessions";
import { useActivityIntervalTimer } from "@/lib/hooks/useActivityIntervalTimer";
import type { IntervalActivity } from "@/lib/utils/intervalActivities";

type IntervalTimerCountdownProps = {
  templateId: string;
  templateName: string;
  activities: IntervalActivity[];
};

export function IntervalTimerCountdown({
  templateId,
  templateName,
  activities,
}: IntervalTimerCountdownProps) {
  const {
    timerState,
    currentActivityIndex,
    elapsedTime,
    globalElapsedTime,
    start,
    pause,
    resume,
    stop,
  } = useActivityIntervalTimer(activities);

  const sessionIdRef = useRef<string | null>(null);
  const terminalSentRef = useRef(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const currentActivity = activities[currentActivityIndex];
  const accentColor = currentActivity?.color ?? "#E74C3C";

  useEffect(() => {
    if (timerState !== "finished" || !sessionIdRef.current || terminalSentRef.current) {
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
  }, [timerState]);

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
    if (timerState !== "finished" && sessionIdRef.current && !terminalSentRef.current) {
      const { error } = await updateTimerSession(sessionIdRef.current, "cancelled");
      if (error) setSessionError(error);
      terminalSentRef.current = true;
    }
    stop();
    sessionIdRef.current = null;
    terminalSentRef.current = false;
  }, [timerState, stop]);

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-transparent px-4 py-4 text-slate-100 md:py-6">
      <h1 className="heading-font text-center text-2xl font-bold text-slate-100 md:text-3xl">{templateName}</h1>

      {sessionError ? (
        <p className="mt-2 max-w-md text-center text-sm text-red-300" role="alert">
          {sessionError}
        </p>
      ) : null}

      <p className="mt-2 text-sm font-medium text-slate-400 md:text-base">
        Activity {Math.min(currentActivityIndex + 1, activities.length)} / {activities.length}
      </p>

      <div className="mt-4 w-full max-w-md">
        <IntervalTimerCircle
          activities={activities}
          currentActivityIndex={currentActivityIndex}
          elapsedTime={elapsedTime}
          globalElapsedTime={globalElapsedTime}
          timerState={timerState}
        />
      </div>

      {timerState === "finished" ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="interval-complete-title"
        >
          <div className="max-w-sm rounded-2xl border border-white/10 bg-slate-900 px-8 py-10 text-center shadow-xl shadow-black/40">
            <h2 id="interval-complete-title" className="heading-font text-2xl font-bold text-emerald-300">
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
        {timerState === "idle" ? (
          <button
            type="button"
            onClick={() => void handleStart()}
            disabled={isStarting || activities.length === 0}
            className="rounded-full px-8 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
          >
            {isStarting ? "Starting…" : "▶ Start"}
          </button>
        ) : null}

        {timerState === "running" ? (
          <button
            type="button"
            onClick={() => void handlePause()}
            className="rounded-full px-8 py-3 text-base font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            ⏸ Pause
          </button>
        ) : null}

        {timerState === "paused" ? (
          <button
            type="button"
            onClick={() => void handleResume()}
            className="rounded-full px-8 py-3 text-base font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            ▶ Resume
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => void handleStopOrDismiss()}
          className="rounded-full bg-slate-800 px-8 py-3 text-base font-semibold text-slate-100 transition hover:bg-slate-700"
        >
          Stop
        </button>
      </div>
    </section>
  );
}
