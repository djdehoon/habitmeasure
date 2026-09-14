import {
  computeActivitiesDurationSeconds,
  parseStoredActivities,
  validateIntervalActivities,
  type IntervalActivity,
} from "@/lib/utils/intervalActivities";
import { computeIntervalDurationSeconds } from "@/lib/utils/timerHelpers";

export type ParsedIntervalPayload = {
  duration_seconds: number;
  activities: IntervalActivity[];
  work_seconds: number | null;
  rest_seconds: number | null;
  rounds: number | null;
};

export function parseIntervalPayloadFromBody(body: Record<string, unknown>): {
  ok: true;
  payload: ParsedIntervalPayload;
} | { ok: false; error: string } {
  const rawActivities = body.activities;
  if (Array.isArray(rawActivities) && rawActivities.length > 0) {
    const activities = parseStoredActivities(rawActivities);
    const validationError = validateIntervalActivities(activities);
    if (validationError) {
      return { ok: false, error: validationError };
    }
    const duration_seconds = computeActivitiesDurationSeconds(activities);
    const firstWork = activities.find((a) => a.type === "work") ?? activities[0];
    const firstRest = activities.find((a) => a.type === "rest");
    return {
      ok: true,
      payload: {
        duration_seconds,
        activities,
        work_seconds: firstWork ? Math.max(1, Math.floor(firstWork.duration)) : null,
        rest_seconds: firstRest ? Math.max(1, Math.floor(firstRest.duration)) : null,
        rounds: Math.max(1, activities.filter((a) => a.type === "work").length),
      },
    };
  }

  const work = Math.floor(Number(body.work_seconds ?? body.workSeconds ?? 0));
  const rest = Math.floor(Number(body.rest_seconds ?? body.restSeconds ?? 0));
  const rounds = Math.floor(Number(body.rounds ?? 0));

  if (!Number.isFinite(work) || work < 1) {
    return { ok: false, error: "work_seconds must be at least 1." };
  }
  if (!Number.isFinite(rest) || rest < 1) {
    return { ok: false, error: "rest_seconds must be at least 1." };
  }
  if (!Number.isFinite(rounds) || rounds < 1 || rounds > 999) {
    return { ok: false, error: "rounds must be between 1 and 999." };
  }

  const duration_seconds = computeIntervalDurationSeconds(work, rest, rounds);
  if (duration_seconds < 1 || duration_seconds > 5999) {
    return { ok: false, error: "Total duration must be between 1 and 5999 seconds." };
  }

  return {
    ok: true,
    payload: {
      duration_seconds,
      activities: [],
      work_seconds: work,
      rest_seconds: rest,
      rounds,
    },
  };
}
