"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CountdownSetupModal } from "@/components/lab/CountdownSetupModal";
import {
  COUNTDOWN_DEFAULTS,
  mapFormDataToUpsertFields,
  mapTemplateToFormData,
  normalizeAddTimeButtons,
  validateCountdownTemplateForm,
  type AddTimeButtonValue,
  type CountdownTemplateFormData,
  type CountdownTemplateFormErrors,
  type TimerTemplate,
} from "@/lib/utils/timerHelpers";

type AddTimerModalProps = {
  open: boolean;
  onClose: () => void;
  timerType?: string;
  editingTemplateId?: string | null;
};

export function AddTimerModal({ open, onClose, timerType, editingTemplateId = null }: AddTimerModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CountdownTemplateFormData>(COUNTDOWN_DEFAULTS);
  const [errors, setErrors] = useState<CountdownTemplateFormErrors>({});
  const [isFetchingTemplate, setIsFetchingTemplate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = Boolean(editingTemplateId);

  const title = useMemo(() => (isEditMode ? "Edit Timer" : "+ Add Timer"), [isEditMode]);
  const submitLabel = useMemo(() => {
    if (isSubmitting) return "Saving...";
    return isEditMode ? "Save Changes" : "Done";
  }, [isEditMode, isSubmitting]);

  const resetForm = () => {
    setFormData(COUNTDOWN_DEFAULTS);
    setErrors({});
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting || isFetchingTemplate) return;
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!open || !editingTemplateId) return;

    let isActive = true;

    const loadTemplate = async () => {
      try {
        setIsFetchingTemplate(true);
        setError(null);

        const response = await fetch(`/api/timers/${editingTemplateId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          if (isActive) {
            setError(payload?.error ?? "Failed to load timer.");
          }
          return;
        }

        const payload = (await response.json()) as { template?: TimerTemplate };
        const template = payload.template;

        if (!template) {
          if (isActive) setError("Timer template not found.");
          return;
        }

        if (!isActive) return;

        setFormData(mapTemplateToFormData(template));
        setErrors({});
      } catch {
        if (isActive) setError("Network error while loading timer.");
      } finally {
        if (isActive) setIsFetchingTemplate(false);
      }
    };

    void loadTemplate();

    return () => {
      isActive = false;
    };
  }, [editingTemplateId, open]);

  if (!open) return null;

  const handleDone = async () => {
    const validationErrors = validateCountdownTemplateForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setError(null);

    try {
      setIsSubmitting(true);
      const endpoint = isEditMode ? "/api/timers/update" : "/api/timers/create";
      const method = isEditMode ? "PUT" : "POST";
      const payload = mapFormDataToUpsertFields({
        ...formData,
        addTimeButtons: normalizeAddTimeButtons(formData.addTimeButtons),
      });

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEditMode ? { templateId: editingTemplateId } : {}),
          ...(!isEditMode ? { timerType: timerType ?? "countdown" } : {}),
          ...payload,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? (isEditMode ? "Failed to update timer." : "Failed to create timer."));
        return;
      }

      resetForm();
      router.refresh();
      onClose();
    } catch {
      setError(isEditMode ? "Network error while updating timer." : "Network error while creating timer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-3xl rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F5F7FA] p-5 text-[#1A1A2E]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isFetchingTemplate}
            className="btn-ghost rounded-md px-2.5 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </div>

        {isFetchingTemplate ? (
          <p className="mb-4 rounded-md bg-[#00E5C0]/15 p-2 text-sm text-[#0f8f7a]">Loading timer...</p>
        ) : null}
        {error ? <p className="mb-4 rounded-md bg-[#E74C3C]/15 p-2 text-sm text-[#b2372b]">{error}</p> : null}

        <CountdownSetupModal
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting || isFetchingTemplate}
          isEditMode={isEditMode}
          doneLabel={submitLabel}
          onChange={(patch) => {
            setFormData((prev) => ({ ...prev, ...patch }));
            setErrors({});
            setError(null);
          }}
          onToggleQuickButton={(value: AddTimeButtonValue) => {
            setFormData((prev) => {
              const hasValue = prev.addTimeButtons.includes(value);
              const nextButtons = hasValue
                ? prev.addTimeButtons.filter((button) => button !== value)
                : [...prev.addTimeButtons, value];
              return { ...prev, addTimeButtons: normalizeAddTimeButtons(nextButtons) };
            });
            setErrors({});
          }}
          onCancel={handleClose}
          onDone={handleDone}
        />
      </div>
    </div>
  );
}
