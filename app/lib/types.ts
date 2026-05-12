/**
 * Shared app types. Timer templates remain defined in @/lib/utils/timerHelpers.
 */

export type TimerSessionStatus = "running" | "paused" | "completed" | "cancelled";

export type TimerSessionRow = {
  id: string;
  user_id: string;
  template_id: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  status: TimerSessionStatus;
};

export type { TimerTemplate, TimerType } from "@/lib/utils/timerHelpers";
