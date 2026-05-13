"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CountdownSetupModal } from "@/components/lab/CountdownSetupModal";
import { useTimerTemplates } from "@/lib/hooks/useTimerTemplates";
import {
  COUNTDOWN_DEFAULTS,
  mapFormDataToUpsertFields,
  mapTemplateToFormData,
  normalizeAddTimeButtons,
  validateCountdownTemplateForm,
  type AddTimeButtonValue,
  type CountdownTemplateFormData,
  type CountdownTemplateFormErrors,
} from "@/lib/utils/timerHelpers";

type SetupPageClientProps = {
  templateId: string | null;
};

export function SetupPageClient({ templateId }: SetupPageClientProps) {
  const router = useRouter();
  const isEditMode = useMemo(() => Boolean(templateId), [templateId]);
  const { getTemplate, createTemplate, updateTemplate, deleteTemplate } = useTimerTemplates();

  const [formData, setFormData] = useState<CountdownTemplateFormData>(COUNTDOWN_DEFAULTS);
  const [errors, setErrors] = useState<CountdownTemplateFormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;

    let alive = true;
    const loadTemplate = async () => {
      setIsLoading(true);
      const result = await getTemplate(templateId);
      if (!alive) return;

      if (result.error || !result.data) {
        setFetchError(result.error ?? "Template not found.");
      } else {
        setFormData(mapTemplateToFormData(result.data));
      }
      setIsLoading(false);
    };

    void loadTemplate();
    return () => {
      alive = false;
    };
  }, [getTemplate, templateId]);

  const handleDone = async () => {
    const validationErrors = validateCountdownTemplateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const payload = mapFormDataToUpsertFields({
      ...formData,
      addTimeButtons: normalizeAddTimeButtons(formData.addTimeButtons),
    });

    const result = templateId ? await updateTemplate(templateId, payload) : await createTemplate(payload);
    setIsSubmitting(false);

    if (result.error) {
      setFetchError(result.error);
      return;
    }

    router.push("/lab");
  };

  const handleDelete = async () => {
    if (!templateId) return;
    const confirmed = window.confirm("Are you sure?");
    if (!confirmed) return;

    setIsSubmitting(true);
    const result = await deleteTemplate(templateId);
    setIsSubmitting(false);

    if (result.error) {
      setFetchError(result.error);
      return;
    }

    router.push("/lab");
  };

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 text-slate-100 sm:p-6">
        <p className="text-slate-400">Loading template...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-4 text-slate-100 sm:p-6">
      {fetchError ? (
        <p className="mb-4 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{fetchError}</p>
      ) : null}

      <CountdownSetupModal
        formData={formData}
        errors={errors}
        isSubmitting={isSubmitting}
        isEditMode={isEditMode}
        onChange={(patch) => {
          setFormData((prev) => ({ ...prev, ...patch }));
          setErrors({});
          setFetchError(null);
        }}
        onToggleQuickButton={(value: AddTimeButtonValue) => {
          setFormData((prev) => {
            const hasValue = prev.addTimeButtons.includes(value);
            const nextButtons = hasValue
              ? prev.addTimeButtons.filter((button) => button !== value)
              : [...prev.addTimeButtons, value];
            return { ...prev, addTimeButtons: normalizeAddTimeButtons(nextButtons) };
          });
        }}
        onCancel={() => router.push("/lab")}
        onDone={handleDone}
        onDelete={isEditMode ? handleDelete : undefined}
      />
    </main>
  );
}
