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
        setFetchError(result.error ?? "Template niet gevonden.");
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
    const confirmed = window.confirm("Weet je zeker?");
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
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <p className="text-white/70">Template laden...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      {fetchError ? <p className="mb-4 rounded-md bg-[#E74C3C]/15 p-3 text-sm text-[#ffb5ad]">{fetchError}</p> : null}

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
