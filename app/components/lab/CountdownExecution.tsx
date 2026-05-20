"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { DelayedStartModal } from "@/app/components/lab/DelayedStartModal";
import { CountdownControlButtons } from "@/app/components/lab/CountdownControlButtons";
import {
  countdownRingColumnWidth,
  premiumCard,
  premiumCardInteractive,
  premiumLabel,
  premiumMuted,
  premiumStatusBadge,
  premiumTabActive,
  premiumTabBar,
  premiumTabInactive,
  premiumValue,
} from "@/app/components/lab/countdownPremiumStyles";
import { ProgressRing } from "@/app/components/lab/ProgressRing";
import type { TimerSessionRow } from "@/app/lib/types";
import {
  play5MinWarningSound,
  play5SecWarningSound,
  playFinishSound,
  playLongStartSound,
  playPauseSound,
  playStartSound,
} from "@/app/lib/sounds";
import { useCountdown, type CountdownState } from "@/lib/hooks/useCountdown";
import {
  createTimerSession,
  listSessionsForTemplate,
  updateTimerSession,
} from "@/lib/hooks/useTimerSessions";
import { addTimeButtonToSeconds } from "@/lib/utils/addTimeSeconds";
import {
  formatClock,
  ringClockClassName,
  ringStatusClassName,
  statusLabel,
} from "@/lib/utils/countdownFormat";
import { computeSessionStats, formatTotalDuration } from "@/lib/utils/sessionStats";
import {
  normalizeAddTimeButtons,
  type AddTimeButtonValue,
  type TimerTemplate,
} from "@/lib/utils/timerHelpers";

type TabId = "control" | "stats" | "history";

type CountdownExecutionProps = {
  template: TimerTemplate;
};

function formatSessionDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function CountdownExecution({ template }: CountdownExecutionProps) {
  const routineColor = template.color?.trim() || "#FFEB3B";
  const durationSeconds = Math.max(1, Math.floor(Number(template.duration_seconds)));
  const minDelay = Math.max(0, Math.floor(Number(template.min_delay_seconds) || 0));
  const quickButtons = normalizeAddTimeButtons(template.add_time_buttons);

  const { state, timeRemaining, progress, start, startWithDelay, pause, resume, reset, addTime } =
    useCountdown(durationSeconds);

  const [activeTab, setActiveTab] = useState<TabId>("control");
  const [delayModalOpen, setDelayModalOpen] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [sessions, setSessions] = useState<TimerSessionRow[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const terminalSentRef = useRef(false);
  const prevStateRef = useRef(state);
  const fiveMinWarnedRef = useRef(false);
  const fiveSecWarnedRef = useRef(false);
  const ringContainerRef = useRef<HTMLDivElement>(null);
  const [ringRadius, setRingRadius] = useState(140);

  const ringMode = state === "idle" || state === "waiting" ? "full" : state === "finished" ? "done" : "partial";
  const ringStrokeColor = ringMode === "done" ? "#22c55e" : routineColor;
  const label = statusLabel(state);

  useEffect(() => {
    const element = ringContainerRef.current;
    if (!element) return;

    const updateRadius = () => {
      const { width, height } = element.getBoundingClientRect();
      const size = Math.min(width, height);
      if (size <= 0) return;
      const next = Math.floor(size / 2) - 10;
      setRingRadius(Math.min(180, Math.max(120, next)));
    };

    updateRadius();
    const observer = new ResizeObserver(updateRadius);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const circleAriaLabel = useMemo(() => {
    const labels: Record<CountdownState, string> = {
      idle: "Start timer",
      waiting: "Start timer now",
      running: "Pause timer",
      paused: "Resume timer",
      finished: "Reset timer",
    };
    return labels[state];
  }, [state]);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    const { data, error } = await listSessionsForTemplate(template.id);
    setSessionsLoading(false);
    if (error) {
      setSessionsError(error);
      return;
    }
    setSessions(data ?? []);
  }, [template.id]);

  const selectTab = useCallback(
    (tab: TabId) => {
      setActiveTab(tab);
      if (tab === "stats" || tab === "history") {
        void loadSessions();
      }
    },
    [loadSessions],
  );

  const closeSession = useCallback(async (status: "completed" | "cancelled") => {
    if (!sessionIdRef.current || terminalSentRef.current) return;
    const { error } = await updateTimerSession(sessionIdRef.current, status);
    if (error) setSessionError(error);
    else terminalSentRef.current = true;
  }, []);

  const openSession = useCallback(async () => {
    if (sessionIdRef.current) return;
    setSessionError(null);
    setIsStarting(true);
    try {
      const { data, error } = await createTimerSession(template.id);
      if (error || !data) {
        setSessionError(error ?? "Could not start session.");
        return;
      }
      sessionIdRef.current = data.session_id;
      terminalSentRef.current = false;
    } finally {
      setIsStarting(false);
    }
  }, [template.id]);

  useEffect(() => {
    if (state === "idle" || state === "finished") {
      fiveMinWarnedRef.current = false;
      fiveSecWarnedRef.current = false;
      return;
    }

    if (state === "waiting") {
      if (timeRemaining >= 1 && timeRemaining <= 5) {
        play5SecWarningSound();
      }
      return;
    }

    if (timeRemaining > 300) {
      fiveMinWarnedRef.current = false;
    }
    if (timeRemaining > 5) {
      fiveSecWarnedRef.current = false;
    }

    if (state !== "running") return;

    if (timeRemaining === 300 && !fiveMinWarnedRef.current) {
      fiveMinWarnedRef.current = true;
      play5MinWarningSound();
    }
    if (timeRemaining === 5 && !fiveSecWarnedRef.current) {
      fiveSecWarnedRef.current = true;
      play5SecWarningSound();
    }
  }, [state, timeRemaining]);

  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;

    if (prev === "waiting" && state === "running") {
      playLongStartSound();
      void openSession();
    } else if (prev !== "running" && state === "running" && prev !== "waiting") {
      void openSession();
    }

    if (state === "finished" && prev !== "finished") {
      playFinishSound();
      void (async () => {
        await closeSession("completed");
        void loadSessions();
        if (template.autocompletion) {
          setTimeout(() => {
            sessionIdRef.current = null;
            terminalSentRef.current = false;
            reset();
          }, 800);
        }
      })();
    }
  }, [state, openSession, closeSession, loadSessions, template.autocompletion, reset]);

  useEffect(() => {
    return () => {
      if (sessionIdRef.current && !terminalSentRef.current) {
        void updateTimerSession(sessionIdRef.current, "cancelled");
      }
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (state === "idle") {
      if (minDelay > 0) playStartSound();
      else playLongStartSound();
      start(durationSeconds, minDelay > 0 ? minDelay : 0);
    } else if (state === "paused") {
      playStartSound();
      void (async () => {
        if (sessionIdRef.current) {
          const { error } = await updateTimerSession(sessionIdRef.current, "running");
          if (error) setSessionError(error);
        }
        resume();
      })();
    } else if (state === "finished") {
      if (minDelay > 0) playStartSound();
      else playLongStartSound();
      sessionIdRef.current = null;
      terminalSentRef.current = false;
      start(durationSeconds, minDelay > 0 ? minDelay : 0);
    }
  }, [state, start, resume, durationSeconds, minDelay]);

  const handlePause = useCallback(() => {
    if (state !== "running") return;
    playPauseSound();
    void (async () => {
      if (sessionIdRef.current) {
        const { error } = await updateTimerSession(sessionIdRef.current, "paused");
        if (error) setSessionError(error);
      }
      pause();
    })();
  }, [state, pause]);

  const handleReset = useCallback(() => {
    void (async () => {
      const sessionId = sessionIdRef.current;
      const shouldCancel = Boolean(sessionId && !terminalSentRef.current);
      sessionIdRef.current = null;
      terminalSentRef.current = false;
      fiveMinWarnedRef.current = false;
      fiveSecWarnedRef.current = false;
      reset();
      if (shouldCancel && sessionId) {
        const { error } = await updateTimerSession(sessionId, "cancelled");
        if (error) setSessionError(error);
      }
      void loadSessions();
    })();
  }, [reset, loadSessions]);

  const handleDelayedConfirm = useCallback(
    (delaySeconds: number) => {
      playStartSound();
      if (state === "idle" || state === "finished") {
        sessionIdRef.current = null;
        terminalSentRef.current = false;
        start(durationSeconds, delaySeconds);
      } else {
        startWithDelay(delaySeconds);
      }
    },
    [state, start, startWithDelay, durationSeconds],
  );

  const handleCircleClick = useCallback(() => {
    if (state === "idle") {
      void handlePlay();
    } else if (state === "waiting") {
      playLongStartSound();
      sessionIdRef.current = null;
      terminalSentRef.current = false;
      start(durationSeconds, 0);
    } else if (state === "running") {
      void handlePause();
    } else if (state === "paused") {
      void handlePlay();
    } else if (state === "finished") {
      void handleReset();
    }
  }, [state, handlePlay, handlePause, handleReset, start, durationSeconds]);

  const handleCircleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      void handleCircleClick();
    },
    [handleCircleClick],
  );

  const stats = useMemo(() => computeSessionStats(sessions), [sessions]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "control", label: "CONTROL" },
    { id: "stats", label: "STATS" },
    { id: "history", label: "HISTORY" },
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-black text-slate-100">
      <header className="relative flex items-center justify-center border-b border-white/10 px-4 py-3">
        <Link
          href="/lab"
          className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          ✕
        </Link>
        <h1 className="max-w-[60%] truncate text-sm font-medium">{template.template_name}</h1>
        <Link
          href={`/lab?edit=${template.id}`}
          className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-label="Edit timer"
        >
          🔧
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center px-4 pt-4 pb-4">
        <div
          ref={ringContainerRef}
          role="button"
          tabIndex={0}
          aria-label={circleAriaLabel}
          onClick={() => void handleCircleClick()}
          onKeyDown={handleCircleKeyDown}
          className={`relative mx-auto flex ${countdownRingColumnWidth} min-w-[min(92vw,22rem)] shrink-0 flex-1 max-h-[min(52dvh,22rem)] cursor-pointer select-none aspect-square transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
        >
          <ProgressRing
            radius={ringRadius}
            color={routineColor}
            progress={progress}
            mode={ringMode}
            isPulsing={state === "running"}
            className="h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="flex max-w-[90%] flex-col items-center gap-2"
              aria-live="polite"
            >
              <span className={ringClockClassName(state)}>{formatClock(timeRemaining)}</span>
              <div
                className="h-px w-[80%] shrink-0"
                style={{ backgroundColor: ringStrokeColor, opacity: 0.5 }}
                aria-hidden
              />
              <span className={ringStatusClassName(state)}>{label}</span>
            </div>
            
          </div>
        </div>

        {sessionError ? (
          <p className="mt-2 shrink-0 text-center text-sm text-red-300" role="alert">
            {sessionError}
          </p>
        ) : null}

        <div className={`mx-auto mt-4 flex min-h-0 flex-1 flex-col ${countdownRingColumnWidth}`}>
          <nav className={premiumTabBar} aria-label="Timer sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectTab(tab.id)}
                className={activeTab === tab.id ? premiumTabActive : premiumTabInactive}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-3 w-full min-h-0 flex-1">
          {activeTab === "control" ? (
            <CountdownControlButtons
              state={state}
              isStarting={isStarting}
              quickButtons={quickButtons}
              onPlay={() => void handlePlay()}
              onPause={() => void handlePause()}
              onReset={() => void handleReset()}
              onAddTime={(value) => addTime(addTimeButtonToSeconds(value))}
              onDelayedStart={() => setDelayModalOpen(true)}
            />
          ) : null}

          {activeTab === "stats" ? (
            <div className="space-y-2">
              {sessionsLoading ? (
                <p className={premiumMuted}>Loading stats…</p>
              ) : sessionsError ? (
                <p className="text-center text-xs text-red-300">{sessionsError}</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <StatCard label="Total runs" value={String(stats.totalRuns)} />
                  <StatCard label="Completed" value={String(stats.completedCount)} />
                  <StatCard label="Total time" value={formatTotalDuration(stats.totalSeconds)} />
                  <StatCard
                    label="Last completed"
                    value={
                      stats.lastCompletedAt ? formatSessionDate(stats.lastCompletedAt) : "—"
                    }
                  />
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "history" ? (
            <div className="max-h-[40vh] space-y-2 overflow-y-auto">
              {sessionsLoading ? (
                <p className={premiumMuted}>Loading history…</p>
              ) : sessionsError ? (
                <p className="text-center text-xs text-red-300">{sessionsError}</p>
              ) : sessions.length === 0 ? (
                <p className={premiumMuted}>No sessions yet.</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between ${premiumCardInteractive}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {formatSessionDate(session.started_at)}
                      </p>
                      {session.duration_seconds != null ? (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {formatTotalDuration(session.duration_seconds)}
                        </p>
                      ) : null}
                    </div>
                    <span className={premiumStatusBadge(session.status)}>{session.status}</span>
                  </div>
                ))
              )}
            </div>
          ) : null}
          </div>
        </div>
      </div>

      <DelayedStartModal
        open={delayModalOpen}
        defaultDelay={minDelay}
        onClose={() => setDelayModalOpen(false)}
        onConfirm={handleDelayedConfirm}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={premiumCard}>
      <p className={premiumLabel}>{label}</p>
      <p className={premiumValue}>{value}</p>
    </div>
  );
}
