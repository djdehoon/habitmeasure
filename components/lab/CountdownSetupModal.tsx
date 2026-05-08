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
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F5F7FA] p-5 text-[#1A1A2E]">
      <h1 className="mb-5 text-2xl font-bold text-[#1A1A2E]">Countdown Timer Setup</h1>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-[#6B7280]">Template Name *</span>
          <input
            type="text"
            value={formData.templateName}
            maxLength={50}
            onChange={(event) => onChange({ templateName: event.target.value })}
            placeholder="Geef je timer een naam"
            className="w-full rounded-md border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 text-[#1A1A2E]"
          />
          {errors.templateName ? <p className="mt-1 text-xs text-[#E74C3C]">{errors.templateName}</p> : null}
        </label>

        <div>
          <span className="mb-1 block text-sm text-[#6B7280]">Duration *</span>
          <DurationPicker
            minutes={formData.durationMinutes}
            seconds={formData.durationSeconds}
            onMinutesChange={(value) => onChange({ durationMinutes: Number.isNaN(value) ? 0 : value })}
            onSecondsChange={(value) => onChange({ durationSeconds: Number.isNaN(value) ? 0 : value })}
          />
          {errors.duration ? <p className="mt-1 text-xs text-[#E74C3C]">{errors.duration}</p> : null}
        </div>

        <div>
          <span className="mb-1 block text-sm text-[#6B7280]">Color *</span>
          <ColorPicker value={formData.color} onChange={(color) => onChange({ color })} />
        </div>

        <div>
          <span className="mb-1 block text-sm text-[#6B7280]">Icon</span>
          <IconPicker value={formData.icon} onChange={(icon) => onChange({ icon })} />
        </div>

        <div>
          <div className="mb-1 text-sm text-[#6B7280]">Automatisch bijhouden</div>
          <label className="inline-flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.autocompletion}
              onChange={(event) => onChange({ autocompletion: event.target.checked })}
              className="h-5 w-5 accent-[#00E5C0]"
            />
            <span className="text-sm text-[#1A1A2E]">Timer logt automatisch als hij klaar is</span>
          </label>
        </div>

        <div>
          <div className="mb-1 text-sm text-[#6B7280]">Minimale wachttijd voordat timer start</div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={formData.minDelaySeconds}
              onChange={(event) => onChange({ minDelaySeconds: Number(event.target.value) })}
              className="w-full accent-[#00E5C0]"
            />
            <span className="w-10 text-right text-sm">{formData.minDelaySeconds}s</span>
          </div>
          {errors.minDelaySeconds ? <p className="mt-1 text-xs text-[#E74C3C]">{errors.minDelaySeconds}</p> : null}
        </div>

        <div>
          <div className="mb-1 text-sm text-[#6B7280]">Snelle knoppen</div>
          <div className="flex flex-wrap gap-4">
            {QUICK_ADD_BUTTONS.map((option) => (
              <label key={option.value} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.addTimeButtons.includes(option.value)}
                  onChange={() => onToggleQuickButton(option.value)}
                  className="h-4 w-4 accent-[#00E5C0]"
                />
                {option.label}
              </label>
            ))}
          </div>
          {errors.addTimeButtons ? <p className="mt-1 text-xs text-[#E74C3C]">{errors.addTimeButtons}</p> : null}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-[#6B7280]">Notes</span>
          <textarea
            value={formData.notes}
            maxLength={200}
            onChange={(event) => onChange({ notes: event.target.value })}
            placeholder="Bijzonderheden over deze timer..."
            className="min-h-24 w-full rounded-md border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 text-[#1A1A2E]"
          />
          <div className="mt-1 text-right text-xs text-[#6B7280]">{formData.notes.length}/200</div>
          {errors.notes ? <p className="mt-1 text-xs text-[#E74C3C]">{errors.notes}</p> : null}
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {isEditMode && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={isSubmitting}
            className="rounded-md border border-[#E74C3C]/70 px-4 py-2 text-[#E74C3C] hover:bg-[#E74C3C]/10 disabled:opacity-50"
          >
            Verwijderen
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn-ghost rounded-md px-4 py-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDone}
            disabled={isSubmitting}
            className="rounded-md bg-[#00E5C0] px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : (doneLabel ?? "Done")}
          </button>
        </div>
      </div>
    </div>
  );
}
