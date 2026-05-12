"use client";

import type { TimerSessionRow, TimerSessionStatus } from "@/app/lib/types";

type StartResult =
  | { data: { session_id: string; started_at: string }; error: null }
  | { data: null; error: string };

type UpdateResult = { data: TimerSessionRow | null; error: string | null };

export async function createTimerSession(templateId: string): Promise<StartResult> {
  try {
    const response = await fetch("/api/timer-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_id: templateId }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { session_id?: string; started_at?: string; error?: string }
      | null;

    if (!response.ok) {
      return { data: null, error: payload?.error ?? "Failed to start session." };
    }

    const sessionId = payload?.session_id;
    const startedAt = payload?.started_at;
    if (!sessionId || !startedAt) {
      return { data: null, error: "Invalid session response." };
    }

    return { data: { session_id: sessionId, started_at: startedAt }, error: null };
  } catch {
    return { data: null, error: "Network error while starting session." };
  }
}

export async function updateTimerSession(
  sessionId: string,
  status: TimerSessionStatus,
): Promise<UpdateResult> {
  try {
    const response = await fetch("/api/timer-sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, status }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { session?: TimerSessionRow; error?: string }
      | null;

    if (!response.ok) {
      return { data: null, error: payload?.error ?? "Failed to update session." };
    }

    return { data: payload?.session ?? null, error: null };
  } catch {
    return { data: null, error: "Network error while updating session." };
  }
}

/** @deprecated Fase 2 list API — use createTimerSession / updateTimerSession for interval logging. */
export function useTimerSessions() {
  return {
    listSessions: async () => ({ data: [], error: null as string | null }),
    createTimerSession,
    updateTimerSession,
  };
}
