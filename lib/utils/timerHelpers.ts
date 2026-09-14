import {
  computeActivitiesDurationSeconds,
  createDefaultActivity,
  getIntervalActivities,
  type IntervalActivity,
  validateIntervalActivities,
} from "@/lib/utils/intervalActivities";

export type { IntervalActivity, IntervalActivityType } from "@/lib/utils/intervalActivities";
export {
  calculateActivityBlocks,
  computeActivitiesDurationSeconds,
  createDefaultActivity,
  createIntervalActivityId,
  formatActivitiesTotalDuration,
  getIntervalActivities,
  validateIntervalActivities,
} from "@/lib/utils/intervalActivities";

export type TimerType = "countdown" | "interval";

export type AddTimeButtonValue = "5s" | "10s" | "30s" | "1m";

export type TimerTemplate = {
  id: string;
  user_id: string;
  template_name: string;
  timer_type: TimerType;
  duration_seconds: number;
  color: string;
  icon: string;
  autocompletion: boolean;
  min_delay_seconds: number;
  add_time_buttons: AddTimeButtonValue[];
  notes: string | null;
  work_seconds: number | null;
  rest_seconds: number | null;
  rounds: number | null;
  activities: IntervalActivity[] | unknown;
  created_at: string;
  updated_at: string;
};

export type TimerTemplatePayload = Omit<TimerTemplate, "id" | "created_at" | "updated_at">;
export type TimerTemplateUpsertFields = Omit<TimerTemplatePayload, "user_id">;

export type CountdownTemplateFormData = {
  templateName: string;
  durationMinutes: number;
  durationSeconds: number;
  color: string;
  icon: string;
  autocompletion: boolean;
  minDelaySeconds: number;
  addTimeButtons: AddTimeButtonValue[];
  notes: string;
};

export type CountdownTemplateFormErrors = Partial<{
  templateName: string;
  duration: string;
  notes: string;
  addTimeButtons: string;
  minDelaySeconds: string;
}>;

export type IntervalTemplateFormData = {
  templateName: string;
  activities: IntervalActivity[];
  color: string;
  icon: string;
};

export type IntervalTemplateFormErrors = Partial<{
  templateName: string;
  activities: string;
}>;

export const TIMER_COLORS = [
  "#00E5C0",
  "#FFEB3B",
  "#FF8C42",
  "#E74C3C",
  "#27AE60",
  "#0C3D3A",
  "#9B59B6",
  "#34495E",
] as const;

const TIMER_COLOR_LABELS = [
  "Teal",
  "Yellow",
  "Orange",
  "Red",
  "Green",
  "Deep teal",
  "Purple",
  "Slate",
] as const;

function normalizeHexForMatch(hex: string): string {
  const t = hex.trim();
  if (!t) return "";
  const body = t.startsWith("#") ? t.slice(1) : t;
  return body.toUpperCase();
}

/** Short label for a palette swatch, or `"Custom"` when the hex is not in `TIMER_COLORS`. */
export function labelForTimerColor(hex: string): string {
  const key = normalizeHexForMatch(hex);
  for (let i = 0; i < TIMER_COLORS.length; i++) {
    if (normalizeHexForMatch(TIMER_COLORS[i]) === key) {
      return TIMER_COLOR_LABELS[i];
    }
  }
  return "Custom";
}

export const TIMER_ICONS = ["⏱️", "🏋️", "🧘", "📚", "🎯", "🏃", "💪", "🧠", "⚡", "🌅"] as const;

export const QUICK_ADD_BUTTONS: ReadonlyArray<{ label: string; value: AddTimeButtonValue }> = [
  { label: "+5s", value: "5s" },
  { label: "+10s", value: "10s" },
  { label: "+30s", value: "30s" },
  { label: "+1m", value: "1m" },
];

export const COUNTDOWN_DEFAULTS: CountdownTemplateFormData = {
  templateName: "",
  durationMinutes: 10,
  durationSeconds: 0,
  color: "#00E5C0",
  icon: "⏱️",
  autocompletion: true,
  minDelaySeconds: 5,
  addTimeButtons: ["5s"],
  notes: "",
};

export const INTERVAL_DEFAULTS: IntervalTemplateFormData = {
  templateName: "",
  activities: [createDefaultActivity({ name: "Focus", duration: 20, type: "work" })],
  color: "#E74C3C",
  icon: "🏋️",
};

export const TIMER_TYPE_OPTIONS = [
  { id: "countdown", name: "Countdown Timer", emoji: "✅", enabled: true },
  { id: "quick", name: "Quick Timer", emoji: "⏳", enabled: false },
  { id: "countup", name: "CountUp Timer", emoji: "⬆️", enabled: false },
  { id: "pomodoro", name: "Pomodoro Timer", emoji: "🍅", enabled: false },
  { id: "interval", name: "Interval Timer", emoji: "🔄", enabled: true },
  { id: "stopwatch", name: "Stopwatch", emoji: "⏱️", enabled: false },
  { id: "counter", name: "Counter", emoji: "🔢", enabled: false },
  { id: "clock", name: "Clock", emoji: "🕐", enabled: false },
  { id: "container", name: "Container", emoji: "📦", enabled: false },
] as const;

export function clampDuration(totalSeconds: number): number {
  return Math.min(5999, Math.max(1, Math.floor(totalSeconds)));
}

export function toDurationParts(totalSeconds: number): { minutes: number; seconds: number } {
  const clamped = clampDuration(totalSeconds);
  return {
    minutes: Math.floor(clamped / 60),
    seconds: clamped % 60,
  };
}

export function toDurationSeconds(minutes: number, seconds: number): number {
  return clampDuration(minutes * 60 + seconds);
}

export function formatDuration(totalSeconds: number): string {
  const { minutes, seconds } = toDurationParts(totalSeconds);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Total session length: N work periods and N−1 rests between them. */
export function computeIntervalDurationSeconds(workSeconds: number, restSeconds: number, rounds: number): number {
  const w = Math.max(1, Math.floor(workSeconds));
  const r = Math.max(1, Math.floor(restSeconds));
  const n = Math.max(1, Math.floor(rounds));
  return n * w + Math.max(0, n - 1) * r;
}

export function formatIntervalSummary(template: TimerTemplate): string {
  if (template.timer_type !== "interval") return formatDuration(template.duration_seconds);
  const activities = getIntervalActivities(template);
  if (activities.length > 0) {
    return `${activities.length} activities · ${formatDuration(computeActivitiesDurationSeconds(activities))}`;
  }
  return formatDuration(template.duration_seconds);
}

export function hasValidIntervalFields(template: TimerTemplate): boolean {
  if (template.timer_type !== "interval") return false;
  const work = Number(template.work_seconds);
  const rest = Number(template.rest_seconds);
  const rounds = Number(template.rounds);
  return (
    Number.isFinite(work) &&
    work > 0 &&
    Number.isFinite(rest) &&
    rest > 0 &&
    Number.isFinite(rounds) &&
    rounds > 0
  );
}

export function hasValidIntervalConfig(template: TimerTemplate): boolean {
  if (template.timer_type !== "interval") return false;
  const activities = getIntervalActivities(template);
  return activities.length > 0 && validateIntervalActivities(activities) === null;
}

export function getTimerFullscreenHref(template: TimerTemplate): string | null {
  if (template.timer_type === "countdown") {
    return `/lab/countdown/${template.id}`;
  }
  if (template.timer_type === "interval" && hasValidIntervalConfig(template)) {
    return `/lab/${template.id}`;
  }
  return null;
}

export function mapTemplateToFormData(template: TimerTemplate): CountdownTemplateFormData {
  const { minutes, seconds } = toDurationParts(template.duration_seconds);
  return {
    templateName: template.template_name,
    durationMinutes: minutes,
    durationSeconds: seconds,
    color: template.color ?? COUNTDOWN_DEFAULTS.color,
    icon: template.icon ?? COUNTDOWN_DEFAULTS.icon,
    autocompletion: template.autocompletion ?? true,
    minDelaySeconds: template.min_delay_seconds ?? 5,
    addTimeButtons: normalizeAddTimeButtons(template.add_time_buttons),
    notes: template.notes ?? "",
  };
}

export function mapFormDataToPayload(formData: CountdownTemplateFormData, userId: string): TimerTemplatePayload {
  return {
    user_id: userId,
    template_name: formData.templateName.trim(),
    timer_type: "countdown",
    duration_seconds: toDurationSeconds(formData.durationMinutes, formData.durationSeconds),
    color: formData.color,
    icon: formData.icon,
    autocompletion: formData.autocompletion,
    min_delay_seconds: formData.minDelaySeconds,
    add_time_buttons: normalizeAddTimeButtons(formData.addTimeButtons),
    notes: formData.notes.trim() ? formData.notes.trim() : null,
    work_seconds: null,
    rest_seconds: null,
    rounds: null,
    activities: [],
  };
}

export function mapTemplateToIntervalFormData(template: TimerTemplate): IntervalTemplateFormData {
  const activities = getIntervalActivities(template);
  return {
    templateName: template.template_name,
    activities: activities.length > 0 ? activities : INTERVAL_DEFAULTS.activities,
    color: template.color ?? INTERVAL_DEFAULTS.color,
    icon: template.icon ?? INTERVAL_DEFAULTS.icon,
  };
}

export function mapIntervalFormDataToUpsertFields(formData: IntervalTemplateFormData): TimerTemplateUpsertFields {
  const activities = formData.activities;
  const duration_seconds = computeActivitiesDurationSeconds(activities);
  const firstWork = activities.find((a) => a.type === "work") ?? activities[0];
  const firstRest = activities.find((a) => a.type === "rest");
  return {
    template_name: formData.templateName.trim(),
    timer_type: "interval",
    duration_seconds,
    color: formData.color || firstWork?.color || INTERVAL_DEFAULTS.color,
    icon: formData.icon.trim() || INTERVAL_DEFAULTS.icon,
    autocompletion: true,
    min_delay_seconds: 5,
    add_time_buttons: ["5s"],
    notes: null,
    work_seconds: firstWork ? Math.max(1, Math.floor(firstWork.duration)) : null,
    rest_seconds: firstRest ? Math.max(1, Math.floor(firstRest.duration)) : null,
    rounds: Math.max(1, activities.filter((a) => a.type === "work").length),
    activities,
  };
}

export function mapFormDataToUpsertFields(formData: CountdownTemplateFormData): TimerTemplateUpsertFields {
  const { user_id, ...rest } = mapFormDataToPayload(formData, "");
  void user_id;
  return rest;
}

export function normalizeAddTimeButtons(values: string[] | null | undefined): AddTimeButtonValue[] {
  const allowed: AddTimeButtonValue[] = ["5s", "10s", "30s", "1m"];
  const unique = Array.from(new Set(values ?? []));
  const cleaned = unique.filter((value): value is AddTimeButtonValue =>
    allowed.includes(value as AddTimeButtonValue),
  );
  return cleaned.length > 0 ? cleaned : ["5s"];
}

export function validateCountdownTemplateForm(formData: CountdownTemplateFormData): CountdownTemplateFormErrors {
  const errors: CountdownTemplateFormErrors = {};
  const name = formData.templateName.trim();
  const notes = formData.notes.trim();
  const durationSeconds = formData.durationMinutes * 60 + formData.durationSeconds;

  if (!name || name.length < 1) {
    errors.templateName = "Template name is required.";
  } else if (name.length > 50) {
    errors.templateName = "Template name must be at most 50 characters.";
  }

  if (durationSeconds < 1 || durationSeconds > 5999) {
    errors.duration = "Duration must be between 00:01 and 99:59.";
  }

  if (notes.length > 200) {
    errors.notes = "Notes must be at most 200 characters.";
  }

  const minDelay = formData.minDelaySeconds;
  if (minDelay !== 0 && (minDelay < 5 || minDelay > 60 || minDelay % 5 !== 0)) {
    errors.minDelaySeconds = "Use 0 for no delay, or choose 5–60 seconds in steps of 5.";
  }

  if (formData.addTimeButtons.length === 0) {
    errors.addTimeButtons = "Select at least one quick-add button.";
  }

  return errors;
}

export function validateIntervalTemplateForm(formData: IntervalTemplateFormData): IntervalTemplateFormErrors {
  const errors: IntervalTemplateFormErrors = {};
  const name = formData.templateName.trim();

  if (!name || name.length < 1) {
    errors.templateName = "Template name is required.";
  } else if (name.length > 50) {
    errors.templateName = "Template name must be at most 50 characters.";
  }

  const activitiesError = validateIntervalActivities(formData.activities);
  if (activitiesError) {
    errors.activities = activitiesError;
  }

  return errors;
}
