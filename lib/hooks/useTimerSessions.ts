"use client";

import type { TimerSessionRow, TimerSessionStatus } from "@/app/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const TERMINAL_STATUSES = new Set(["completed", "cancelled"]);

type StartResult =
  | { data: { session_id: string; started_at: string }; error: null }
  | { data: null; error: string };

type UpdateResult = { data: TimerSessionRow | null; error: string | null };

export async function createTimerSession(templateId: string): Promise<StartResult> {
  const trimmed = templateId.trim();
  if (!trimmed) {
    return { data: null, error: "template_id is required." };
  }

  try {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: "Unauthorized." };
    }

    const { data: template, error: templateError } = await supabase
      .from("timer_templates")
      .select("id")
      .eq("id", trimmed)
      .eq("user_id", user.id)
      .maybeSingle();

    if (templateError || !template) {
      return { data: null, error: "Template not found." };
    }

    const { data, error } = await supabase
      .from("timer_sessions")
      .insert({
        user_id: user.id,
        template_id: trimmed,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select("id, started_at")
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data?.id || !data.started_at) {
      return { data: null, error: "Invalid session response." };
    }

    return { data: { session_id: data.id, started_at: data.started_at }, error: null };
  } catch {
    return { data: null, error: "Network error while starting session." };
  }
}

export async function updateTimerSession(
  sessionId: string,
  status: TimerSessionStatus,
): Promise<UpdateResult> {
  const trimmedId = sessionId.trim();
  if (!trimmedId) {
    return { data: null, error: "session_id is required." };
  }

  const allowed = new Set<TimerSessionStatus>(["running", "paused", "completed", "cancelled"]);
  if (!allowed.has(status)) {
    return { data: null, error: "Invalid status." };
  }

  try {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: "Unauthorized." };
    }

    const { data: existing, error: fetchError } = await supabase
      .from("timer_sessions")
      .select("id, started_at, status")
      .eq("id", trimmedId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError || !existing) {
      return { data: null, error: "Session not found." };
    }

    if (TERMINAL_STATUSES.has(existing.status as TimerSessionStatus)) {
      return { data: null, error: "Session is already closed." };
    }

    const patch: Record<string, unknown> = { status };

    if (TERMINAL_STATUSES.has(status)) {
      const started = new Date(existing.started_at as string).getTime();
      const durationSeconds = Math.max(0, Math.floor((Date.now() - started) / 1000));
      patch.completed_at = new Date().toISOString();
      patch.duration_seconds = durationSeconds;
    }

    const { data, error } = await supabase
      .from("timer_sessions")
      .update(patch)
      .eq("id", trimmedId)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as TimerSessionRow, error: null };
  } catch {
    return { data: null, error: "Network error while updating session." };
  }
}

type ListSessionsResult =
  | { data: TimerSessionRow[]; error: null }
  | { data: null; error: string };

export async function listSessionsForTemplate(
  templateId: string,
  limit = 50,
): Promise<ListSessionsResult> {
  const trimmed = templateId.trim();
  if (!trimmed) {
    return { data: null, error: "template_id is required." };
  }

  try {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: "Unauthorized." };
    }

    const { data, error } = await supabase
      .from("timer_sessions")
      .select("*")
      .eq("template_id", trimmed)
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data ?? []) as TimerSessionRow[], error: null };
  } catch {
    return { data: null, error: "Network error while loading sessions." };
  }
}

export function useTimerSessions() {
  return {
    listSessionsForTemplate,
    createTimerSession,
    updateTimerSession,
  };
}
