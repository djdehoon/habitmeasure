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
      <header className="border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 xl:max-w-7xl">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100">
            <span className="flex items-center gap-2 heading-font text-lg font-bold text-slate-100 sm:text-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
              HabitMeasure
            </span>
            <span className="heading-font text-lg font-bold text-slate-300 sm:text-xl">Routine lab</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTypeSelectorOpen(true)}
              className="rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300"
            >
              + Add timer
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isSigningOut}
              className="min-w-[100px] rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:opacity-60"
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

      <div className="mx-auto w-full max-w-6xl p-2 sm:p-4 xl:max-w-7xl">{children}</div>
    </>
  );
}
