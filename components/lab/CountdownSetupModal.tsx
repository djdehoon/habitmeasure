import { ColorPicker } from "@/components/lab/ColorPicker";
import { DurationPicker } from "@/components/lab/DurationPicker";
import { IconPicker } from "@/components/lab/IconPicker";
import {
  QUICK_ADD_BUTTONS,
  type AddTimeButtonValue,
  type CountdownTemplateFormData,
  type CountdownTemplateFormErrors,
} from "@/lib/utils/timerHelpers";

type CountdownSetupModalProps = {
  formData: CountdownTemplateFormData;
  errors: CountdownTemplateFormErrors;
  isSubmitting: boolean;
  isEditMode: boolean;
  doneLabel?: string;
  onChange: (patch: Partial<CountdownTemplateFormData>) => void;
  onToggleQuickButton: (value: AddTimeButtonValue) => void;
  onCancel: () => void;
  onDone: () => void;
  onDelete?: () => void;
};

export function CountdownSetupModal({
  formData,
  errors,
  isSubmitting,
  isEditMode,
  doneLabel,
  onChange,
  onToggleQuickButton,
  onCancel,
  onDone,
  onDelete,
}: CountdownSetupModalProps) {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-white/10 bg-slate-900/70 p-5 text-slate-100">
      <h1 className="mb-5 text-2xl font-bold text-slate-100">Countdown routine setup</h1>

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

        <div>
          <span className="mb-1 block text-sm text-slate-400">Duration *</span>
          <DurationPicker
            minutes={formData.durationMinutes}
            seconds={formData.durationSeconds}
            onMinutesChange={(value) => onChange({ durationMinutes: Number.isNaN(value) ? 0 : value })}
            onSecondsChange={(value) => onChange({ durationSeconds: Number.isNaN(value) ? 0 : value })}
          />
          {errors.duration ? <p className="mt-1 text-xs text-red-300">{errors.duration}</p> : null}
        </div>

        <div>
          <span className="mb-1 block text-sm text-slate-400">Color *</span>
          <ColorPicker value={formData.color} onChange={(color) => onChange({ color })} />
        </div>

        <div>
          <span className="mb-1 block text-sm text-slate-400">Icon</span>
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

        <div>
          <div className="mb-1 text-sm text-slate-400">Quick-add buttons</div>
          <div className="flex flex-wrap gap-4">
            {QUICK_ADD_BUTTONS.map((option) => (
              <label key={option.value} className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.addTimeButtons.includes(option.value)}
                  onChange={() => onToggleQuickButton(option.value)}
                  className="h-4 w-4 accent-emerald-400"
                />
                {option.label}
              </label>
            ))}
          </div>
          {errors.addTimeButtons ? <p className="mt-1 text-xs text-red-300">{errors.addTimeButtons}</p> : null}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Notes</span>
          <textarea
            value={formData.notes}
            maxLength={200}
            onChange={(event) => onChange({ notes: event.target.value })}
            placeholder="Notes for this routine (optional)"
            className="min-h-24 w-full rounded-md border border-white/15 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500"
          />
          <div className="mt-1 text-right text-xs text-slate-500">{formData.notes.length}/200</div>
          {errors.notes ? <p className="mt-1 text-xs text-red-300">{errors.notes}</p> : null}
        </label>
      </div>

      <div className="sticky bottom-0 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-900/90 pt-4">
        {isEditMode && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={isSubmitting}
            className="rounded-md border border-red-400/50 px-4 py-2 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            Delete
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-white/15 bg-slate-950 px-4 py-2 text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDone}
            disabled={isSubmitting}
            className="rounded-md bg-emerald-400 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : (doneLabel ?? "Done")}
          </button>
        </div>
      </div>
    </div>
  );
}
