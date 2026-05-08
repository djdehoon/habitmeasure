"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type TimerDeleteButtonProps = {
  templateId: string;
  className?: string;
  onDeleted?: () => void;
  confirmText?: string;
};

export default function TimerDeleteButton({
  templateId,
  className,
  onDeleted,
  confirmText = "Weet je zeker?",
}: TimerDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(confirmText);
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/timers/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      if (!response.ok) {
        let message = "Verwijderen mislukt.";
        try {
          const data = (await response.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          // No JSON response body available.
        }
        setError(message);
        return;
      }

      onDeleted?.();
      router.refresh();
    } catch {
      setError("Netwerkfout tijdens verwijderen.");
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
        className={
          className ??
          "rounded-md border border-[#E74C3C]/50 bg-white px-3 py-1.5 text-sm text-[#E74C3C] transition hover:bg-[#E74C3C]/10 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {isDeleting ? "Deleting..." : "Del"}
      </button>
      {error ? <p className="text-xs text-[#b2372b]">{error}</p> : null}
    </div>
  );
}
