"use client";

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
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F5F7FA] p-5 text-[#1A1A2E]">
      <h1 className="mb-5 text-2xl font-bold text-[#1A1A2E]">Interval Timer Setup</h1>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-[#6B7280]">Template Name *</span>
          <input
            type="text"
            value={formData.templateName}
            maxLength={50}
            onChange={(event) => onChange({ templateName: event.target.value })}
            placeholder="Name your workout"
            className="w-full rounded-md border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 text-[#1A1A2E]"
          />
          {errors.templateName ? <p className="mt-1 text-xs text-[#E74C3C]">{errors.templateName}</p> : null}
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm text-[#6B7280]">Work (seconds) *</span>
            <input
              type="number"
              min={1}
              step={1}
              value={formData.workSeconds}
              onChange={(event) => onChange({ workSeconds: Number(event.target.value) })}
              className="w-full rounded-md border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 text-[#1A1A2E]"
            />
            {errors.workSeconds ? <p className="mt-1 text-xs text-[#E74C3C]">{errors.workSeconds}</p> : null}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-[#6B7280]">Rest (seconds) *</span>
            <input
              type="number"
              min={1}
              step={1}
              value={formData.restSeconds}
              onChange={(event) => onChange({ restSeconds: Number(event.target.value) })}
              className="w-full rounded-md border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 text-[#1A1A2E]"
            />
            {errors.restSeconds ? <p className="mt-1 text-xs text-[#E74C3C]">{errors.restSeconds}</p> : null}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-[#6B7280]">Rounds *</span>
            <input
              type="number"
              min={1}
              max={999}
              step={1}
              value={formData.rounds}
              onChange={(event) => onChange({ rounds: Number(event.target.value) })}
              className="w-full rounded-md border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 text-[#1A1A2E]"
            />
            {errors.rounds ? <p className="mt-1 text-xs text-[#E74C3C]">{errors.rounds}</p> : null}
          </label>
        </div>

        <div>
          <span className="mb-1 block text-sm text-[#6B7280]">Color</span>
          <ColorPicker value={formData.color} onChange={(color) => onChange({ color })} />
        </div>

        <div>
          <span className="mb-1 block text-sm text-[#6B7280]">Icon</span>
          <IconPicker value={formData.icon} onChange={(icon) => onChange({ icon })} />
        </div>

        <p className="text-sm text-[#6B7280]">
          Each round is one work period. Rest happens between work periods (no rest after the final work).
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-[rgba(0,0,0,0.12)] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A2E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDone}
            disabled={isSubmitting}
            className="rounded-lg bg-[#00E5C0] px-5 py-2.5 text-sm font-semibold text-[#0C3D3A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {doneLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
