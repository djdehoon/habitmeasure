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
    const confirmed = window.confirm("Delete this timer?");
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
        setError(payload?.error ?? "Failed to delete timer.");
        return;
      }

      onDeleted();
    } catch {
      setError("Network error while deleting timer.");
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
        className="rounded-md border border-[#E74C3C]/50 bg-white px-3 py-1.5 text-sm text-[#E74C3C] transition hover:bg-[#E74C3C]/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
      {error ? <p className="text-xs text-[#b2372b]">{error}</p> : null}
    </div>
  );
}
