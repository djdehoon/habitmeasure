"use client";

import { useCallback, useSyncExternalStore } from "react";
import { TimerCardCompact } from "@/app/components/lab/TimerCardCompact";
import { TimerCardEdit } from "@/app/components/lab/TimerCardEdit";
import { TimerCardView2 } from "@/app/components/lab/TimerCardView2";
import type { TimerTemplate } from "@/lib/utils/timerHelpers";

const STORAGE_KEY = "habitMeasureViewMode";
const STORAGE_EVENT = "habitmeasure:viewMode";

type ViewMode = "view1" | "view2" | "edit";

function parseStoredViewMode(raw: string | null): ViewMode | null {
  if (raw === "view1" || raw === "view2" || raw === "edit") return raw;
  return null;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onStoreChange();
  };
  const onLocal = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(STORAGE_EVENT, onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STORAGE_EVENT, onLocal);
  };
}

function readViewModeFromStorage(): ViewMode {
  if (typeof window === "undefined") return "view1";
  return parseStoredViewMode(window.localStorage.getItem(STORAGE_KEY)) ?? "view1";
}

const VIEW_GRID = "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4";
const EDIT_GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

export function TimerGridClient({ templates }: { templates: TimerTemplate[] }) {
  const viewMode = useSyncExternalStore(subscribe, readViewModeFromStorage, () => "view1");

  const handleViewChange = useCallback((mode: ViewMode) => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-slate-100">Your routines</h2>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Routine list display mode">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "view2"}
            onClick={() => handleViewChange("view2")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === "view2"
                ? "bg-emerald-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            View 2
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "view1"}
            onClick={() => handleViewChange("view1")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === "view1"
                ? "bg-emerald-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            View 1
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "edit"}
            onClick={() => handleViewChange("edit")}
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

      {viewMode === "view1" ? (
        <div className={VIEW_GRID}>
          {templates.map((template) => (
            <TimerCardCompact key={template.id} template={template} />
          ))}
        </div>
      ) : viewMode === "view2" ? (
        <div className={VIEW_GRID}>
          {templates.map((template) => (
            <TimerCardView2 key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <div className={EDIT_GRID}>
          {templates.map((template) => (
            <TimerCardEdit key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
