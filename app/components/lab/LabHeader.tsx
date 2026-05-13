"use client";

import { useState } from "react";
import { AddTimerModal } from "@/app/components/lab/AddTimerModal";

export function LabHeader() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <header className="border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-100">Routine lab</h1>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300"
          >
            + Add routine
          </button>
        </div>
      </header>

      <AddTimerModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
