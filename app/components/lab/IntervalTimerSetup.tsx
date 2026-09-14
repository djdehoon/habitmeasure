"use client";

import { IntervalActivityEditor } from "@/app/components/lab/IntervalActivityEditor";
import { ColorPicker } from "@/components/lab/ColorPicker";
import { IconPicker } from "@/components/lab/IconPicker";
import type { IntervalTemplateFormData, IntervalTemplateFormErrors } from "@/lib/utils/timerHelpers";

type IntervalTimerSetupProps = {
  formData: IntervalTemplateFormData;
  errors: IntervalTemplateFormErrors;
  isSubmitting: boolean;
  doneLabel?: string;
  onChange: (patch: Partial<IntervalTemplateFormData>) => void;
  onCancel: () => void;
  onDone: () => void;
};

export function IntervalTimerSetup({
  formData,
  errors,
  isSubmitting,
  doneLabel = "Done",
  onChange,
  onCancel,
  onDone,
}: IntervalTimerSetupProps) {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-white/10 bg-slate-900/70 p-5 text-slate-100">
      <h1 className="mb-5 text-2xl font-bold text-slate-100">Interval timer setup</h1>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Template Name *</span>
          <input
            type="text"
            value={formData.templateName}
            maxLength={50}
            onChange={(event) => onChange({ templateName: event.target.value })}
            placeholder="Name your routine"
            className="w-full rounded-md border border-white/15 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500"
          />
          {errors.templateName ? <p className="mt-1 text-xs text-red-300">{errors.templateName}</p> : null}
        </label>

        <IntervalActivityEditor
          activities={formData.activities}
          onChange={(activities) => onChange({ activities })}
          error={errors.activities}
        />

        <div>
          <span className="mb-1 block text-sm text-slate-400">Timer color *</span>
          <ColorPicker value={formData.color} onChange={(color) => onChange({ color })} />
        </div>

        <div>
          <span className="mb-1 block text-sm text-slate-400">Default icon</span>
          <IconPicker value={formData.icon} onChange={(icon) => onChange({ icon })} />
        </div>

        <div>
          <div className="mb-1 text-sm text-slate-400">Track automatically</div>
          <label className="inline-flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.autocompletion}
              onChange={(event) => onChange({ autocompletion: event.target.checked })}
              className="h-5 w-5 accent-emerald-400"
            />
            <span className="text-sm text-slate-200">Log this routine automatically when it finishes</span>
          </label>
        </div>

        <div>
          <div className="mb-1 text-sm text-slate-400">Minimum delay before the timer starts</div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={formData.minDelaySeconds}
              onChange={(event) => onChange({ minDelaySeconds: Number(event.target.value) })}
              className="w-full accent-emerald-400"
            />
            <span className="w-10 text-right text-sm text-slate-300">{formData.minDelaySeconds}s</span>
          </div>
          {errors.minDelaySeconds ? <p className="mt-1 text-xs text-red-300">{errors.minDelaySeconds}</p> : null}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Notes</span>
          <textarea
            value={formData.notes}
            maxLength={200}
            onChange={(event) => onChange({ notes: event.target.value })}
            placeholder="Notes for this routine (optional)"
            rows={3}
            className="w-full rounded-md border border-white/15 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500"
          />
          {errors.notes ? <p className="mt-1 text-xs text-red-300">{errors.notes}</p> : null}
        </label>

        <p className="text-sm text-slate-400">
          Activities run in order. The outer ring shows progress for the current activity only; inner blocks
          fill as you complete each step.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-white/15 bg-slate-950 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDone}
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {doneLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
