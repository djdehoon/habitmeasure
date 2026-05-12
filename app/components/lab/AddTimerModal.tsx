"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CountdownSetupModal } from "@/components/lab/CountdownSetupModal";
import { IntervalTimerSetup } from "@/app/components/lab/IntervalTimerSetup";
import {
  COUNTDOWN_DEFAULTS,
  INTERVAL_DEFAULTS,
  mapFormDataToUpsertFields,
  mapIntervalFormDataToUpsertFields,
  mapTemplateToFormData,
  mapTemplateToIntervalFormData,
  normalizeAddTimeButtons,
  validateCountdownTemplateForm,
  validateIntervalTemplateForm,
  type AddTimeButtonValue,
  type CountdownTemplateFormData,
  type CountdownTemplateFormErrors,
  type IntervalTemplateFormData,
  type IntervalTemplateFormErrors,
  type TimerTemplate,
} from "@/lib/utils/timerHelpers";

type AddTimerModalProps = {
  open: boolean;
  onClose: () => void;
  timerType?: string;
  editingTemplateId?: string | null;
};

type ActiveTimerKind = "countdown" | "interval";

export function AddTimerModal({ open, onClose, timerType, editingTemplateId = null }: AddTimerModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CountdownTemplateFormData>(COUNTDOWN_DEFAULTS);
  const [errors, setErrors] = useState<CountdownTemplateFormErrors>({});
  const [intervalFormData, setIntervalFormData] = useState<IntervalTemplateFormData>(INTERVAL_DEFAULTS);
  const [intervalErrors, setIntervalErrors] = useState<IntervalTemplateFormErrors>({});
  const [activeKind, setActiveKind] = useState<ActiveTimerKind>("countdown");
  const [isFetchingTemplate, setIsFetchingTemplate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = Boolean(editingTemplateId);

  const title = useMemo(() => (isEditMode ? "Edit Timer" : "+ Add Timer"), [isEditMode]);
  const submitLabel = useMemo(() => {
    if (isSubmitting) return "Saving...";
    if (isEditMode) return "Save Changes";
    if (activeKind === "interval") return "Create Interval Timer";
    return "Done";
  }, [isEditMode, isSubmitting, activeKind]);

  const resetForm = () => {
    setFormData(COUNTDOWN_DEFAULTS);
    setIntervalFormData(INTERVAL_DEFAULTS);
    setErrors({});
    setIntervalErrors({});
    setActiveKind("countdown");
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting || isFetchingTemplate) return;
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!open || editingTemplateId) return;
    setActiveKind(timerType === "interval" ? "interval" : "countdown");
  }, [open, editingTemplateId, timerType]);

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

        if (template.timer_type === "interval") {
          setActiveKind("interval");
          setIntervalFormData(mapTemplateToIntervalFormData(template));
          setIntervalErrors({});
        } else {
          setActiveKind("countdown");
          setFormData(mapTemplateToFormData(template));
          setErrors({});
        }
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
    if (activeKind === "interval") {
      const validationErrors = validateIntervalTemplateForm(intervalFormData);
      setIntervalErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setError(null);

      try {
        setIsSubmitting(true);
        const endpoint = isEditMode ? "/api/timers/update" : "/api/timers/create";
        const method = isEditMode ? "PUT" : "POST";
        const payload = mapIntervalFormDataToUpsertFields(intervalFormData);

        const response = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(isEditMode ? { templateId: editingTemplateId } : {}),
            ...(!isEditMode ? { timerType: "interval" } : {}),
            ...payload,
          }),
        });

        if (!response.ok) {
          const errPayload = (await response.json().catch(() => null)) as { error?: string } | null;
          setError(errPayload?.error ?? (isEditMode ? "Failed to update timer." : "Failed to create timer."));
          return;
        }

        resetForm();
        onClose();
        router.refresh();
      } catch {
        setError(isEditMode ? "Network error while updating timer." : "Network error while creating timer.");
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

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
        const errPayload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(errPayload?.error ?? (isEditMode ? "Failed to update timer." : "Failed to create timer."));
        return;
      }

      resetForm();
      onClose();
      router.refresh();
    } catch {
      setError(isEditMode ? "Network error while updating timer." : "Network error while creating timer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/35 p-4">
      <div className="flex min-h-full items-start justify-center sm:items-center">
        <div className="my-4 w-full max-w-3xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F5F7FA] p-5 text-[#1A1A2E]">
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

          {activeKind === "interval" ? (
            <IntervalTimerSetup
              formData={intervalFormData}
              errors={intervalErrors}
              isSubmitting={isSubmitting || isFetchingTemplate}
              doneLabel={submitLabel}
              onChange={(patch) => {
                setIntervalFormData((prev) => ({ ...prev, ...patch }));
                setIntervalErrors({});
                setError(null);
              }}
              onCancel={handleClose}
              onDone={handleDone}
            />
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
