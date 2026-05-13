"use client";

import { useState } from "react";

type TimerDeleteButtonProps = {
  templateId: string;
  onDeleted: () => void;
};

export function TimerDeleteButton({ templateId, onDeleted }: TimerDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this routine?");
    if (!confirmed) return;

    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch("/api/timers/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Failed to delete routine.");
        return;
      }

      onDeleted();
    } catch {
      setError("Network error while deleting routine.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded-md border border-red-400/40 bg-slate-950/80 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
