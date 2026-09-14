"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DelayedStartModal } from "@/app/components/lab/DelayedStartModal";
import { IntervalControlButtons, type IntervalControlState } from "@/app/components/lab/IntervalControlButtons";
import { IntervalTimerCircle } from "@/app/components/lab/IntervalTimerCircle";
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
import type { TimerSessionRow } from "@/app/lib/types";
import {
  play5SecWarningSound,
  playFinishSound,
  playLongStartSound,
  playPauseSound,
} from "@/app/lib/sounds";
import { useActivityIntervalTimer } from "@/lib/hooks/useActivityIntervalTimer";
import {
  createTimerSession,
  listSessionsForTemplate,
  updateTimerSession,
} from "@/lib/hooks/useTimerSessions";
import { getIntervalActivities } from "@/lib/utils/intervalActivities";
import { computeSessionStats, formatTotalDuration } from "@/lib/utils/sessionStats";
import type { TimerTemplate } from "@/lib/utils/timerHelpers";

type TabId = "control" | "stats" | "history";

type IntervalTimerCountdownProps = {
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

export function IntervalTimerCountdown({ template }: IntervalTimerCountdownProps) {
  const activities = useMemo(() => getIntervalActivities(template), [template]);
  const minDelay = Math.max(0, Math.floor(Number(template.min_delay_seconds) || 0));

  const {
    timerState,
    currentActivityIndex,
    elapsedTime,
    globalElapsedTime,
    phaseProgress,
    timeRemaining,
    start,
    pause,
    resume,
    stop,
  } = useActivityIntervalTimer(activities);

  const [waitingRemaining, setWaitingRemaining] = useState<number | null>(null);
  const [waitingProgress, setWaitingProgress] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>("control");
  const [delayModalOpen, setDelayModalOpen] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [sessions, setSessions] = useState<TimerSessionRow[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [enterAnim, setEnterAnim] = useState(false);

  const sessionIdRef = useRef<string | null>(null);
  const terminalSentRef = useRef(false);
  const prevTimerStateRef = useRef(timerState);
  const waitingEndsAtRef = useRef<number | null>(null);
  const waitingTotalMsRef = useRef(0);
  const waitingRafRef = useRef<number | null>(null);
  const openSessionAndStartRef = useRef<() => Promise<void>>(async () => {});

  const shellState: IntervalControlState =
    waitingRemaining !== null ? "waiting" : timerState;

  useEffect(() => {
    setEnterAnim(true);
  }, []);

  const openSessionAndStart = useCallback(async () => {
    setSessionError(null);
    setIsStarting(true);
    try {
      if (!sessionIdRef.current) {
        const { data, error } = await createTimerSession(template.id);
        if (error || !data) {
          setSessionError(error ?? "Could not start session.");
          return;
        }
        sessionIdRef.current = data.session_id;
        terminalSentRef.current = false;
      }
      start();
    } finally {
      setIsStarting(false);
    }
  }, [template.id, start]);

  useEffect(() => {
    openSessionAndStartRef.current = openSessionAndStart;
  }, [openSessionAndStart]);

  useEffect(() => {
    if (waitingRemaining === null) {
      waitingEndsAtRef.current = null;
      waitingTotalMsRef.current = 0;
      if (waitingRafRef.current !== null) {
        cancelAnimationFrame(waitingRafRef.current);
        waitingRafRef.current = null;
      }
      return;
    }

    const tick = () => {
      const endsAt = waitingEndsAtRef.current;
      const totalMs = Math.max(1, waitingTotalMsRef.current);
      if (endsAt === null) {
        waitingRafRef.current = requestAnimationFrame(tick);
        return;
      }
      const remainingMs = endsAt - Date.now();
      if (remainingMs <= 0) {
        setWaitingRemaining(null);
        setWaitingProgress(0);
        waitingEndsAtRef.current = null;
        waitingTotalMsRef.current = 0;
        playLongStartSound();
        void openSessionAndStartRef.current();
        return;
      }
      setWaitingProgress(Math.min(1, Math.max(0, remainingMs / totalMs)));
      setWaitingRemaining(Math.max(0, Math.ceil(remainingMs / 1000)));
      waitingRafRef.current = requestAnimationFrame(tick);
    };

    waitingRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (waitingRafRef.current !== null) {
        cancelAnimationFrame(waitingRafRef.current);
        waitingRafRef.current = null;
      }
    };
  }, [waitingRemaining !== null]);

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

  const beginWaiting = useCallback((delaySeconds: number) => {
    const delay = Math.max(0, Math.floor(delaySeconds));
    if (delay <= 0) {
      setWaitingRemaining(null);
      setWaitingProgress(1);
      waitingEndsAtRef.current = null;
      waitingTotalMsRef.current = 0;
      playLongStartSound();
      void openSessionAndStartRef.current();
      return;
    }
    const totalMs = delay * 1000;
    waitingTotalMsRef.current = totalMs;
    waitingEndsAtRef.current = Date.now() + totalMs;
    setWaitingProgress(1);
    setWaitingRemaining(delay);
  }, []);

  useEffect(() => {
    if (shellState !== "waiting" || waitingRemaining === null) return;
    if (waitingRemaining >= 1 && waitingRemaining <= 5) {
      play5SecWarningSound();
    }
  }, [shellState, waitingRemaining]);

  useEffect(() => {
    if (timerState !== "running") return;
    if (timeRemaining >= 1 && timeRemaining <= 5) {
      play5SecWarningSound();
    }
  }, [timerState, timeRemaining]);

  useEffect(() => {
    const prev = prevTimerStateRef.current;
    prevTimerStateRef.current = timerState;

    if (timerState === "finished" && prev !== "finished") {
      playFinishSound();
      void (async () => {
        if (sessionIdRef.current && !terminalSentRef.current) {
          const { error } = await updateTimerSession(sessionIdRef.current, "completed");
          if (error) setSessionError(error);
          else terminalSentRef.current = true;
        }
        void loadSessions();
      })();
    }
  }, [timerState, loadSessions]);

  useEffect(() => {
    return () => {
      if (sessionIdRef.current && !terminalSentRef.current) {
        void updateTimerSession(sessionIdRef.current, "cancelled");
      }
    };
  }, []);

  const handleDismissComplete = useCallback(() => {
    sessionIdRef.current = null;
    terminalSentRef.current = false;
    setWaitingRemaining(null);
    waitingEndsAtRef.current = null;
    stop();
    void loadSessions();
  }, [stop, loadSessions]);

  const handlePlay = useCallback(() => {
    if (shellState === "idle" || shellState === "finished") {
      sessionIdRef.current = null;
      terminalSentRef.current = false;
      if (shellState === "finished") stop();
      beginWaiting(minDelay);
    } else if (shellState === "paused") {
      void (async () => {
        if (sessionIdRef.current) {
          const { error } = await updateTimerSession(sessionIdRef.current, "running");
          if (error) setSessionError(error);
        }
        resume();
      })();
    }
  }, [shellState, minDelay, beginWaiting, resume, stop]);

  const handlePause = useCallback(() => {
    if (shellState !== "running") return;
    playPauseSound();
    void (async () => {
      if (sessionIdRef.current) {
        const { error } = await updateTimerSession(sessionIdRef.current, "paused");
        if (error) setSessionError(error);
      }
      pause();
    })();
  }, [shellState, pause]);

  const handleStop = useCallback(() => {
    void (async () => {
      const sessionId = sessionIdRef.current;
      const shouldCancel = Boolean(sessionId && !terminalSentRef.current);
      setWaitingRemaining(null);
      waitingEndsAtRef.current = null;
      sessionIdRef.current = null;
      terminalSentRef.current = false;
      stop();
      if (shouldCancel && sessionId) {
        const { error } = await updateTimerSession(sessionId, "cancelled");
        if (error) setSessionError(error);
      }
      void loadSessions();
    })();
  }, [stop, loadSessions]);

  const handleDelayedConfirm = useCallback(
    (delaySeconds: number) => {
      if (shellState === "idle" || shellState === "finished") {
        sessionIdRef.current = null;
        terminalSentRef.current = false;
        if (shellState === "finished") stop();
        beginWaiting(delaySeconds);
      }
    },
    [shellState, beginWaiting, stop],
  );

  const handleCircleClick = useCallback(() => {
    if (shellState === "idle" || shellState === "finished") {
      void handlePlay();
    } else if (shellState === "waiting") {
      setWaitingRemaining(null);
      waitingEndsAtRef.current = null;
      playLongStartSound();
      void openSessionAndStart();
    } else if (shellState === "running") {
      void handlePause();
    } else if (shellState === "paused") {
      void handlePlay();
    }
  }, [shellState, handlePlay, handlePause, openSessionAndStart]);

  const circleAriaLabel = useMemo(() => {
    const labels: Record<IntervalControlState, string> = {
      idle: "Start timer",
      waiting: "Start timer now",
      running: "Pause timer",
      paused: "Resume timer",
      finished: "Restart timer",
    };
    return labels[shellState];
  }, [shellState]);

  const stats = useMemo(() => computeSessionStats(sessions), [sessions]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "control", label: "CONTROL" },
    { id: "stats", label: "STATS" },
    { id: "history", label: "HISTORY" },
  ];

  return (
    <div
      className={`flex min-h-[100dvh] flex-col bg-black text-slate-100${enterAnim ? " animate-fullscreen-enter" : ""}`}
    >
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
        <div className={`relative mx-auto flex ${countdownRingColumnWidth} min-w-[min(92vw,22rem)] shrink-0 flex-1 max-h-[min(52dvh,22rem)] aspect-square`}>
          <IntervalTimerCircle
            activities={activities}
            currentActivityIndex={currentActivityIndex}
            elapsedTime={elapsedTime}
            globalElapsedTime={globalElapsedTime}
            phaseProgress={shellState === "waiting" ? waitingProgress : phaseProgress}
            timerState={shellState === "waiting" ? "waiting" : timerState}
            waitingSeconds={waitingRemaining ?? 0}
            templateColor={template.color?.trim() || "#E74C3C"}
            onRingClick={() => void handleCircleClick()}
            ringAriaLabel={circleAriaLabel}
          />
        </div>

        <p className="mt-2 shrink-0 text-sm font-medium text-slate-400">
          Activity {Math.min(currentActivityIndex + 1, Math.max(activities.length, 1))} /{" "}
          {activities.length}
        </p>

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
              <IntervalControlButtons
                state={shellState}
                isStarting={isStarting}
                onPlay={() => void handlePlay()}
                onPause={() => void handlePause()}
                onStop={() => void handleStop()}
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

      {timerState === "finished" ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="interval-complete-title"
        >
          <div className="max-w-sm rounded-2xl border border-white/10 bg-slate-900 px-8 py-10 text-center shadow-xl shadow-black/40">
            <h2 id="interval-complete-title" className="heading-font text-2xl font-bold text-[#00E5C0]">
              Routine Complete!
            </h2>
            <button
              type="button"
              onClick={() => void handleDismissComplete()}
              className="mt-6 rounded-full bg-[#00E5C0] px-8 py-3 text-base font-semibold text-[#0C3D3A] transition hover:bg-[#00d4b2]"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

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
