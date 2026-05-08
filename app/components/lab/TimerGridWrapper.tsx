"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AddTimerModal } from "@/app/components/lab/AddTimerModal";
import { TimerTypeSelector } from "@/app/components/lab/TimerTypeSelector";

type TimerGridWrapperProps = {
  children: React.ReactNode;
};

export function TimerGridWrapper({ children }: TimerGridWrapperProps) {
  const searchParams = useSearchParams();
  const editId = useMemo(() => searchParams.get("edit"), [searchParams]);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [selectedTimerType, setSelectedTimerType] = useState<string | null>(null);

  const isAddModalOpen = Boolean(selectedTimerType) || Boolean(editId);

  const closeModal = () => {
    setSelectedTimerType(null);

    if (editId) {
      window.history.replaceState({}, "", "/lab");
    }
  };

  return (
    <>
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Lab</h1>
          <button
            type="button"
            onClick={() => setIsTypeSelectorOpen(true)}
            className="rounded-lg bg-[#00E5C0] px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
          >
            + Add Timer
          </button>
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
