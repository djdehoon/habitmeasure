"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AddTimerModal } from "@/app/components/lab/AddTimerModal";
import { TimerTypeSelector } from "@/app/components/lab/TimerTypeSelector";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type TimerGridWrapperProps = {
  children: React.ReactNode;
};

export function TimerGridWrapper({ children }: TimerGridWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = useMemo(() => searchParams.get("edit"), [searchParams]);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [selectedTimerType, setSelectedTimerType] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isAddModalOpen = Boolean(selectedTimerType) || Boolean(editId);

  const closeModal = () => {
    setSelectedTimerType(null);

    if (editId) {
      router.replace("/lab");
    }
  };

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push("/auth/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1A1A2E]">
            <span className="flex items-center gap-2 heading-font text-lg font-bold text-slate-800 sm:text-xl">
              <span className="h-2 w-2 rounded-full bg-[#8BA2B5]" />
              HabitMeasure
            </span>
            <span className="heading-font text-lg font-bold text-slate-800 sm:text-xl">Lab</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTypeSelectorOpen(true)}
              className="rounded-lg bg-[#00E5C0] px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
            >
              + Add Timer
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isSigningOut}
              className="min-w-[100px] rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-[#1A1A2E] hover:bg-gray-300 disabled:opacity-60"
            >
              {isSigningOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      </header>

      <TimerTypeSelector
        open={isTypeSelectorOpen}
        onClose={() => setIsTypeSelectorOpen(false)}
        onSelect={(timerType) => {
          setSelectedTimerType(timerType);
          setIsTypeSelectorOpen(false);
        }}
      />
      <AddTimerModal
        open={isAddModalOpen}
        onClose={closeModal}
        timerType={selectedTimerType ?? undefined}
        editingTemplateId={editId}
      />

      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">{children}</div>
    </>
  );
}
