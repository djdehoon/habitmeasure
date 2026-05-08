"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddTimerModal } from "@/components/lab/AddTimerModal";
import { TimerCard } from "@/components/lab/TimerCard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useTimerTemplates } from "@/lib/hooks/useTimerTemplates";
import type { TimerTemplate } from "@/lib/utils/timerHelpers";

export default function LabPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const { listTemplates, deleteTemplate } = useTimerTemplates();

  const [templates, setTemplates] = useState<TimerTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    const result = await listTemplates();
    if (result.error) {
      setError(result.error);
      setTemplates([]);
    } else {
      setTemplates(result.data ?? []);
    }
    setIsLoading(false);
  }, [listTemplates]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTemplates();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTemplates]);

  const handleDelete = async (templateId: string) => {
    const confirmed = window.confirm("Weet je zeker?");
    if (!confirmed) return;

    setDeletingId(templateId);
    const result = await deleteTemplate(templateId);
    if (result.error) {
      setError(result.error);
    } else {
      setTemplates((prev) => prev.filter((template) => template.id !== templateId));
    }
    setDeletingId(null);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Lab</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-md bg-[#00E5C0] px-4 py-2 font-semibold text-black hover:bg-[#00D0AF]"
          >
            + Add Timer
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-md border border-white/25 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-60"
          >
            {isLoggingOut ? "Uitloggen..." : "Logout"}
          </button>
        </div>
      </header>

      {error ? <p className="mb-4 rounded-md bg-[#E74C3C]/15 p-3 text-sm text-[#ffb5ad]">{error}</p> : null}

      {isLoading ? <p className="text-white/70">Templates laden...</p> : null}

      {!isLoading && templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/20 p-8 text-center text-white/75">
          Nog geen timers. Maak er een!
        </div>
      ) : null}

      {!isLoading && templates.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TimerCard
              key={template.id}
              template={template}
              isDeleting={deletingId === template.id}
              onEdit={(templateId) => router.push(`/lab/countdown/setup?id=${templateId}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : null}

      <AddTimerModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectCountdown={() => {
          setIsModalOpen(false);
          router.push("/lab/countdown/setup");
        }}
      />
    </main>
  );
}
