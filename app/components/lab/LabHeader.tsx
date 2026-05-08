"use client";

import { useState } from "react";
import { AddTimerModal } from "@/app/components/lab/AddTimerModal";

export function LabHeader() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Lab</h1>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-[#00E5C0] px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
          >
            + Add Timer
          </button>
        </div>
      </header>

      <AddTimerModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
