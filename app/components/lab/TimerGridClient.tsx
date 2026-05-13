"use client";

import { useState } from "react";
import { TimerCard } from "@/app/components/lab/TimerCard";
import { TimerCardCompact } from "@/app/components/lab/TimerCardCompact";
import type { TimerTemplate } from "@/lib/utils/timerHelpers";

type ViewMode = "view" | "edit";

export function TimerGridClient({ templates }: { templates: TimerTemplate[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("view");

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-slate-100">Your routines</h2>
        <div className="flex gap-2" role="tablist" aria-label="Routine list display mode">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "view"}
            onClick={() => setViewMode("view")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === "view"
                ? "bg-emerald-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            View
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "edit"}
            onClick={() => setViewMode("edit")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === "edit"
                ? "bg-emerald-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Edit
          </button>
        </div>
      </div>

      {viewMode === "view" ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {templates.map((template) => (
            <TimerCardCompact key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TimerCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
