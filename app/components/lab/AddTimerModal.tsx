"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AddTimerModalProps = {
  open: boolean;
  onClose: () => void;
};

const COLOR_OPTIONS = ["#00E5C0", "#FF6B6B", "#4ECDC4", "#FFE66D"] as const;
const ICON_OPTIONS = ["⏱️", "🎯", "💪", "🧘"] as const;

const DEFAULT_FORM = {
  name: "",
  duration: 10,
  color: COLOR_OPTIONS[0],
  icon: ICON_OPTIONS[0],
};

export function AddTimerModal({ open, onClose }: AddTimerModalProps) {
  const router = useRouter();
  const [name, setName] = useState(DEFAULT_FORM.name);
  const [duration, setDuration] = useState<number>(DEFAULT_FORM.duration);
  const [color, setColor] = useState<(typeof COLOR_OPTIONS)[number]>(DEFAULT_FORM.color);
  const [icon, setIcon] = useState<(typeof ICON_OPTIONS)[number]>(DEFAULT_FORM.icon);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const resetForm = () => {
    setName(DEFAULT_FORM.name);
    setDuration(DEFAULT_FORM.duration);
    setColor(DEFAULT_FORM.color);
    setIcon(DEFAULT_FORM.icon);
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/timers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          duration,
          color,
          icon,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Failed to create timer.");
        return;
      }

      resetForm();
      router.refresh();
      onClose();
    } catch {
      setError("Network error while creating timer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-xl rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F5F7FA] p-5 text-[#1A1A2E]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Timer</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="btn-ghost rounded-md px-2.5 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="timer-name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <input
              id="timer-name"
              type="text"
              required
              maxLength={50}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 text-sm outline-none ring-[#00E5C0] focus:ring-2"
              placeholder="Morning Focus"
            />
          </div>

          <div>
            <label htmlFor="timer-duration" className="mb-1 block text-sm font-medium">
              Duration (minutes)
            </label>
            <input
              id="timer-duration"
              type="number"
              min={1}
              required
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="w-full rounded-lg border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 text-sm outline-none ring-[#00E5C0] focus:ring-2"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Color</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((option) => {
                const selected = color === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setColor(option)}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      selected ? "border-[#1A1A2E] scale-105" : "border-transparent"
                    }`}
                    style={{ backgroundColor: option }}
                    aria-label={`Select color ${option}`}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Icon</p>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((option) => {
                const selected = icon === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setIcon(option)}
                    className={`rounded-md border px-3 py-2 text-xl transition ${
                      selected
                        ? "border-[#00E5C0] bg-[#00E5C0]/20"
                        : "border-[rgba(0,0,0,0.1)] bg-white hover:bg-[#00E5C0]/10"
                    }`}
                    aria-label={`Select icon ${option}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? <p className="rounded-md bg-[#E74C3C]/15 p-2 text-sm text-[#b2372b]">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-300 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#00E5C0] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Done"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
