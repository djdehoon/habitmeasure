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
  workSeconds: number;
  restSeconds: number;
  rounds: number;
  color: string;
  icon: string;
};

export type IntervalTemplateFormErrors = Partial<{
  templateName: string;
  workSeconds: string;
  restSeconds: string;
  rounds: string;
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
  workSeconds: 20,
  restSeconds: 10,
  rounds: 8,
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
  const w = template.work_seconds ?? 0;
  const rs = template.rest_seconds ?? 0;
  const n = template.rounds ?? 0;
  if (w <= 0 || rs <= 0 || n <= 0) return formatDuration(template.duration_seconds);
  return `${n}× ${w}s / ${rs}s`;
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
  };
}

export function mapTemplateToIntervalFormData(template: TimerTemplate): IntervalTemplateFormData {
  return {
    templateName: template.template_name,
    workSeconds: template.work_seconds ?? INTERVAL_DEFAULTS.workSeconds,
    restSeconds: template.rest_seconds ?? INTERVAL_DEFAULTS.restSeconds,
    rounds: template.rounds ?? INTERVAL_DEFAULTS.rounds,
    color: template.color ?? INTERVAL_DEFAULTS.color,
    icon: template.icon ?? INTERVAL_DEFAULTS.icon,
  };
}

export function mapIntervalFormDataToUpsertFields(formData: IntervalTemplateFormData): TimerTemplateUpsertFields {
  const work = Math.max(1, Math.floor(Number(formData.workSeconds)));
  const rest = Math.max(1, Math.floor(Number(formData.restSeconds)));
  const rounds = Math.max(1, Math.floor(Number(formData.rounds)));
  const duration_seconds = computeIntervalDurationSeconds(work, rest, rounds);
  return {
    template_name: formData.templateName.trim(),
    timer_type: "interval",
    duration_seconds,
    color: formData.color || INTERVAL_DEFAULTS.color,
    icon: formData.icon.trim() || INTERVAL_DEFAULTS.icon,
    autocompletion: true,
    min_delay_seconds: 5,
    add_time_buttons: ["5s"],
    notes: null,
    work_seconds: work,
    rest_seconds: rest,
    rounds,
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
    errors.templateName = "Template naam is verplicht.";
  } else if (name.length > 50) {
    errors.templateName = "Template naam mag maximaal 50 tekens zijn.";
  }

  if (durationSeconds < 1 || durationSeconds > 5999) {
    errors.duration = "Duur moet tussen 00:01 en 99:59 liggen.";
  }

  if (notes.length > 200) {
    errors.notes = "Notities mogen maximaal 200 tekens zijn.";
  }

  if (formData.minDelaySeconds < 5 || formData.minDelaySeconds > 60 || formData.minDelaySeconds % 5 !== 0) {
    errors.minDelaySeconds = "Minimale wachttijd moet tussen 5 en 60 seconden liggen in stappen van 5.";
  }

  if (formData.addTimeButtons.length === 0) {
    errors.addTimeButtons = "Selecteer minimaal 1 snelle knop.";
  }

  return errors;
}

export function validateIntervalTemplateForm(formData: IntervalTemplateFormData): IntervalTemplateFormErrors {
  const errors: IntervalTemplateFormErrors = {};
  const name = formData.templateName.trim();

  if (!name || name.length < 1) {
    errors.templateName = "Template naam is verplicht.";
  } else if (name.length > 50) {
    errors.templateName = "Template naam mag maximaal 50 tekens zijn.";
  }

  const work = Math.floor(Number(formData.workSeconds));
  const rest = Math.floor(Number(formData.restSeconds));
  const rounds = Math.floor(Number(formData.rounds));

  if (!Number.isFinite(work) || work < 1) {
    errors.workSeconds = "Work moet minstens 1 seconde zijn.";
  }

  if (!Number.isFinite(rest) || rest < 1) {
    errors.restSeconds = "Rust moet minstens 1 seconde zijn.";
  }

  if (!Number.isFinite(rounds) || rounds < 1) {
    errors.rounds = "Rondes moet minstens 1 zijn.";
  } else if (rounds > 999) {
    errors.rounds = "Maximaal 999 rondes.";
  }

  if (!errors.workSeconds && !errors.restSeconds && !errors.rounds) {
    const total = computeIntervalDurationSeconds(work, rest, rounds);
    if (total > 5999) {
      errors.rounds = "Totale duur mag maximaal 99:59 zijn.";
    }
  }

  return errors;
}
