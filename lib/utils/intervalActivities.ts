import type { TimerTemplate } from "@/lib/utils/timerHelpers";

const DEFAULT_INTERVAL_COLOR = "#E74C3C";

export type IntervalActivityType = "warmup" | "work" | "rest";

export type IntervalActivity = {
  id: string;
  name: string;
  duration: number;
  color: string;
  type: IntervalActivityType;
};

export type ActivityBlock = {
  row: number;
  col: number;
  color: string;
  name: string;
  fillPercentage: number;
};

const MAX_ACTIVITIES = 24;
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const ACTIVITY_TYPES: IntervalActivityType[] = ["warmup", "work", "rest"];

export function createIntervalActivityId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultActivity(
  patch?: Partial<Omit<IntervalActivity, "id">>,
): IntervalActivity {
  return {
    id: createIntervalActivityId(),
    name: patch?.name ?? "Focus",
    duration: patch?.duration ?? 20,
    color: patch?.color ?? DEFAULT_INTERVAL_COLOR,
    type: patch?.type ?? "work",
  };
}

export function parseStoredActivities(raw: unknown): IntervalActivity[] {
  if (!Array.isArray(raw)) return [];
  const parsed: IntervalActivity[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id : createIntervalActivityId();
    const name = typeof row.name === "string" ? row.name.trim() : "";
    const duration = Math.floor(Number(row.duration));
    const color = typeof row.color === "string" ? row.color.trim() : DEFAULT_INTERVAL_COLOR;
    const type = row.type as IntervalActivityType;
    if (!name || !Number.isFinite(duration) || duration < 1) continue;
    if (!ACTIVITY_TYPES.includes(type)) continue;
    if (!HEX_COLOR.test(color)) continue;
    parsed.push({ id, name, duration, color, type });
  }
  return parsed.slice(0, MAX_ACTIVITIES);
}

/** Legacy work/rest/rounds → ordered activity list (work then rest between rounds). */
export function synthesizeActivitiesFromLegacy(template: TimerTemplate): IntervalActivity[] {
  const work = Math.max(1, Math.floor(Number(template.work_seconds ?? 0)));
  const rest = Math.max(1, Math.floor(Number(template.rest_seconds ?? 0)));
  const rounds = Math.max(1, Math.floor(Number(template.rounds ?? 0)));
  const workColor = template.color?.trim() || DEFAULT_INTERVAL_COLOR;
  const restColor = "#27AE60";

  if (work <= 0 || rest <= 0 || rounds <= 0) return [];

  const activities: IntervalActivity[] = [];
  for (let round = 1; round <= rounds; round += 1) {
    activities.push({
      id: createIntervalActivityId(),
      name: `Focus ${round}`,
      duration: work,
      color: workColor,
      type: "work",
    });
    if (round < rounds) {
      activities.push({
        id: createIntervalActivityId(),
        name: `Rest ${round}`,
        duration: rest,
        color: restColor,
        type: "rest",
      });
    }
  }
  return activities;
}

export function getIntervalActivities(template: TimerTemplate): IntervalActivity[] {
  const stored = parseStoredActivities(
    (template as TimerTemplate & { activities?: unknown }).activities,
  );
  if (stored.length > 0) return stored;
  return synthesizeActivitiesFromLegacy(template);
}

export function computeActivitiesDurationSeconds(activities: IntervalActivity[]): number {
  return activities.reduce((sum, activity) => sum + Math.max(1, Math.floor(activity.duration)), 0);
}

export function validateIntervalActivities(
  activities: IntervalActivity[],
): string | null {
  if (activities.length < 1) {
    return "Add at least one activity.";
  }
  if (activities.length > MAX_ACTIVITIES) {
    return `At most ${MAX_ACTIVITIES} activities.`;
  }

  const total = computeActivitiesDurationSeconds(activities);
  if (total < 1 || total > 5999) {
    return "Total duration must be between 00:01 and 99:59.";
  }

  for (let i = 0; i < activities.length; i += 1) {
    const activity = activities[i];
    if (!activity.name.trim()) {
      return `Activity ${i + 1} needs a name.`;
    }
    if (activity.name.length > 40) {
      return `Activity ${i + 1} name is too long.`;
    }
    const duration = Math.floor(Number(activity.duration));
    if (!Number.isFinite(duration) || duration < 1 || duration > 5999) {
      return `Activity ${i + 1} duration must be 1–5999 seconds.`;
    }
    if (!HEX_COLOR.test(activity.color)) {
      return `Activity ${i + 1} needs a valid color.`;
    }
    if (!ACTIVITY_TYPES.includes(activity.type)) {
      return `Activity ${i + 1} has an invalid type.`;
    }
  }

  return null;
}

export function calculateActivityBlocks(
  activities: IntervalActivity[],
  globalElapsedTime: number,
): ActivityBlock[] {
  let totalElapsedTime = 0;
  const elapsed = Math.max(0, globalElapsedTime);

  return activities.map((activity, index) => {
    const activityStartTime = totalElapsedTime;
    const activityEndTime = totalElapsedTime + activity.duration;

    let fillPercentage = 0;
    if (elapsed >= activityEndTime) {
      fillPercentage = 100;
    } else if (elapsed >= activityStartTime) {
      const elapsedInActivity = elapsed - activityStartTime;
      fillPercentage = (elapsedInActivity / activity.duration) * 100;
    }

    totalElapsedTime += activity.duration;

    return {
      row: Math.floor(index / 8),
      col: index % 8,
      color: activity.color,
      name: activity.name,
      fillPercentage,
    };
  });
}

export function formatActivitiesTotalDuration(activities: IntervalActivity[]): string {
  const totalSeconds = computeActivitiesDurationSeconds(activities);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}
