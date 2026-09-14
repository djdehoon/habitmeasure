"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { TimerCardEdit } from "@/app/components/lab/TimerCardEdit";
import { TimerCardOverview } from "@/app/components/lab/TimerCardOverview";
import {
  addEmptyGroup,
  flattenSectionsToReorderItems,
  groupTemplatesByName,
  moveTemplateInSections,
  renameGroupInSections,
  type TimerGroupSection,
} from "@/lib/utils/timerGroups";
import { DEFAULT_TIMER_GROUP_NAME, normalizeGroupName, type TimerTemplate } from "@/lib/utils/timerHelpers";

const STORAGE_KEY = "habitMeasureViewMode";
const STORAGE_EVENT = "habitmeasure:viewMode";

type ViewMode = "routines" | "arrange" | "edit";

function parseStoredViewMode(raw: string | null): ViewMode | null {
  if (raw === "routines" || raw === "arrange" || raw === "edit") return raw;
  if (raw === "view1" || raw === "view2") return "routines";
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
  if (typeof window === "undefined") return "routines";
  return parseStoredViewMode(window.localStorage.getItem(STORAGE_KEY)) ?? "routines";
}

const VIEW_GRID = "grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4";
const EDIT_GRID = "grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-4";

export function TimerGridClient({ templates }: { templates: TimerTemplate[] }) {
  const router = useRouter();
  const viewMode = useSyncExternalStore(subscribe, readViewModeFromStorage, () => "routines");

  const serverSections = useMemo(() => groupTemplatesByName(templates), [templates]);
  const [draftSections, setDraftSections] = useState<TimerGroupSection[] | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  const sections = viewMode === "arrange" && draftSections ? draftSections : serverSections;

  const handleViewChange = useCallback(
    (mode: ViewMode) => {
      window.localStorage.setItem(STORAGE_KEY, mode);
      window.dispatchEvent(new Event(STORAGE_EVENT));
      setError(null);
      if (mode === "arrange") {
        setDraftSections(groupTemplatesByName(templates));
      } else {
        setDraftSections(null);
        setDraggingId(null);
      }
    },
    [templates],
  );

  const dropOnCard = useCallback(
    (targetId: string) => {
      if (!draggingId || draggingId === targetId || !draftSections) return;
      let targetGroup = DEFAULT_TIMER_GROUP_NAME;
      let targetIndex = 0;
      for (const section of draftSections) {
        const idx = section.templates.findIndex((t) => t.id === targetId);
        if (idx >= 0) {
          targetGroup = section.groupName;
          targetIndex = idx;
          break;
        }
      }
      setDraftSections(moveTemplateInSections(draftSections, draggingId, targetGroup, targetIndex));
      setDraggingId(null);
    },
    [draggingId, draftSections],
  );

  const dropOnGroup = useCallback(
    (groupName: string) => {
      if (!draggingId || !draftSections) return;
      const section = draftSections.find((s) => s.groupName === groupName);
      const index = section?.templates.length ?? 0;
      setDraftSections(moveTemplateInSections(draftSections, draggingId, groupName, index));
      setDraggingId(null);
    },
    [draggingId, draftSections],
  );

  const saveArrangement = useCallback(async () => {
    if (!draftSections) return;
    setSaving(true);
    setError(null);
    try {
      const items = flattenSectionsToReorderItems(draftSections);
      const response = await fetch("/api/timers/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Could not save arrangement.");
      }
      setDraftSections(null);
      handleViewChange("routines");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save arrangement.");
    } finally {
      setSaving(false);
    }
  }, [draftSections, handleViewChange, router]);

  const discardArrangement = useCallback(() => {
    setDraftSections(groupTemplatesByName(templates));
    setError(null);
  }, [templates]);

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h2 className="text-xl font-semibold text-slate-100">Your routines</h2>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Routine list display mode">
          {(
            [
              ["routines", "Routines"],
              ["arrange", "Arrange"],
              ["edit", "Edit"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={viewMode === mode}
              onClick={() => handleViewChange(mode)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                viewMode === mode
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "edit" ? (
        <div className={EDIT_GRID}>
          {templates.map((template) => (
            <TimerCardEdit key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {viewMode === "arrange" ? (
            <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">Drag cards between groups. Rename groups, then Save.</p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(event) => setNewGroupName(event.target.value)}
                  placeholder="New group name"
                  className="min-w-[10rem] flex-1 rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  maxLength={50}
                />
                <button
                  type="button"
                  className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200 hover:border-emerald-400/40"
                  onClick={() => {
                    const name = normalizeGroupName(newGroupName);
                    setDraftSections((prev) => addEmptyGroup(prev ?? serverSections, name));
                    setNewGroupName("");
                  }}
                >
                  Add group
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                  onClick={discardArrangement}
                  disabled={saving}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 disabled:opacity-60"
                  onClick={() => void saveArrangement()}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save arrangement"}
                </button>
              </div>
              {error ? <p className="w-full text-sm text-red-300">{error}</p> : null}
            </div>
          ) : null}

          {sections.map((section) => (
            <section
              key={section.groupName}
              className="space-y-3"
              onDragOver={(event) => {
                if (viewMode !== "arrange") return;
                event.preventDefault();
              }}
              onDrop={(event) => {
                if (viewMode !== "arrange") return;
                event.preventDefault();
                dropOnGroup(section.groupName);
              }}
            >
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                {viewMode === "arrange" ? (
                  <input
                    type="text"
                    defaultValue={section.groupName}
                    key={`${section.groupName}-name`}
                    aria-label="Group name"
                    className="w-full max-w-xs rounded-md border border-white/15 bg-transparent px-2 py-1 text-sm font-semibold text-slate-100"
                    onBlur={(event) => {
                      const next = normalizeGroupName(event.target.value);
                      setDraftSections((prev) =>
                        renameGroupInSections(prev ?? serverSections, section.groupName, next),
                      );
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        (event.target as HTMLInputElement).blur();
                      }
                    }}
                  />
                ) : (
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    {section.groupName}
                  </h3>
                )}
                <span className="text-xs text-slate-500">{section.templates.length}</span>
              </div>

              {section.templates.length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-sm text-slate-500">
                  Drop routines here
                </p>
              ) : (
                <div className={VIEW_GRID}>
                  {section.templates.map((template) => (
                    <TimerCardOverview
                      key={template.id}
                      template={template}
                      arrangeMode={viewMode === "arrange"}
                      dragging={draggingId === template.id}
                      onDragStart={setDraggingId}
                      onDragEnd={() => setDraggingId(null)}
                      onDropOnCard={dropOnCard}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
