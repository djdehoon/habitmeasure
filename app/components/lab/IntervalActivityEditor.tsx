"use client";

import { ColorPicker } from "@/components/lab/ColorPicker";
import {
  computeActivitiesDurationSeconds,
  createDefaultActivity,
  formatActivitiesTotalDuration,
  type IntervalActivity,
  type IntervalActivityType,
} from "@/lib/utils/intervalActivities";

const MAX_ACTIVITIES = 24;

type IntervalActivityEditorProps = {
  activities: IntervalActivity[];
  onChange: (activities: IntervalActivity[]) => void;
  error?: string;
};

const TYPE_OPTIONS: { value: IntervalActivityType; label: string }[] = [
  { value: "warmup", label: "Warmup" },
  { value: "work", label: "Work" },
  { value: "rest", label: "Rest" },
];

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length || from === to) return items;
  const next = [...items];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

export function IntervalActivityEditor({ activities, onChange, error }: IntervalActivityEditorProps) {
  const totalLabel = formatActivitiesTotalDuration(activities);
  const canAdd = activities.length < MAX_ACTIVITIES;

  const updateActivity = (index: number, patch: Partial<IntervalActivity>) => {
    onChange(activities.map((activity, i) => (i === index ? { ...activity, ...patch } : activity)));
  };

  const removeActivity = (index: number) => {
    if (activities.length <= 1) return;
    onChange(activities.filter((_, i) => i !== index));
  };

  const addActivity = () => {
    if (!canAdd) return;
    onChange([...activities, createDefaultActivity({ name: `Activity ${activities.length + 1}`, type: "work" })]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-400">Activities *</span>
        <span className="text-sm text-slate-500">
          Total: {totalLabel} ({computeActivitiesDurationSeconds(activities)}s)
        </span>
      </div>

      <ul className="space-y-3">
        {activities.map((activity, index) => (
          <li
            key={activity.id}
            className="rounded-lg border border-white/10 bg-slate-950/80 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {index + 1}. {activity.type}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => onChange(moveItem(activities, index, index - 1))}
                  className="rounded border border-white/10 px-2 py-0.5 text-xs text-slate-400 hover:bg-white/5 disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === activities.length - 1}
                  onClick={() => onChange(moveItem(activities, index, index + 1))}
                  className="rounded border border-white/10 px-2 py-0.5 text-xs text-slate-400 hover:bg-white/5 disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={activities.length <= 1}
                  onClick={() => removeActivity(index)}
                  className="rounded border border-red-400/30 px-2 py-0.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-30"
                  aria-label="Remove activity"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs text-slate-500">Name</span>
                <input
                  type="text"
                  maxLength={40}
                  value={activity.name}
                  onChange={(event) => updateActivity(index, { name: event.target.value })}
                  className="w-full rounded-md border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">Duration (sec)</span>
                <input
                  type="number"
                  min={1}
                  max={5999}
                  step={1}
                  value={activity.duration}
                  onChange={(event) =>
                    updateActivity(index, { duration: Math.max(1, Math.floor(Number(event.target.value))) })
                  }
                  className="w-full rounded-md border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">Type</span>
                <select
                  value={activity.type}
                  onChange={(event) =>
                    updateActivity(index, { type: event.target.value as IntervalActivityType })
                  }
                  className="w-full rounded-md border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3">
              <span className="mb-1 block text-xs text-slate-500">Color</span>
              <ColorPicker
                value={activity.color}
                onChange={(color) => updateActivity(index, { color })}
              />
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={!canAdd}
        onClick={addActivity}
        className="w-full rounded-lg border border-dashed border-white/20 py-2 text-sm font-medium text-slate-300 transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        + Add activity {canAdd ? `(${activities.length}/${MAX_ACTIVITIES})` : "(max reached)"}
      </button>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
