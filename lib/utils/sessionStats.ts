import type { TimerSessionRow } from "@/app/lib/types";

export type SessionStats = {
  totalRuns: number;
  completedCount: number;
  totalSeconds: number;
  lastCompletedAt: string | null;
};

export function computeSessionStats(sessions: TimerSessionRow[]): SessionStats {
  let completedCount = 0;
  let totalSeconds = 0;
  let lastCompletedAt: string | null = null;

  for (const session of sessions) {
    if (session.status === "completed") {
      completedCount += 1;
      totalSeconds += session.duration_seconds ?? 0;
      const at = session.completed_at ?? session.started_at;
      if (!lastCompletedAt || at > lastCompletedAt) {
        lastCompletedAt = at;
      }
    }
  }

  return {
    totalRuns: sessions.length,
    completedCount,
    totalSeconds,
    lastCompletedAt,
  };
}

export function formatTotalDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  if (minutes < 60) return rem > 0 ? `${minutes}m ${rem}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
