"use client";

import { useEffect, useState } from "react";

type TimerTypeSelectorProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (timerType: string) => void;
};

type TimerTypeOption = {
  id: string;
  name: string;
  emoji: string;
  enabled: boolean;
};

const TIMER_TYPES: TimerTypeOption[] = [
  { id: "countdown", name: "Countdown Timer", emoji: "🟢", enabled: true },
  { id: "quick", name: "Quick Timer", emoji: "⏳", enabled: false },
  { id: "countup", name: "CountUp Timer", emoji: "⏱️", enabled: false },
  { id: "pomodoro", name: "Pomodoro Timer", emoji: "🍅", enabled: false },
  { id: "interval", name: "Interval Timer", emoji: "⏰", enabled: true },
  { id: "stopwatch", name: "Stopwatch", emoji: "⏱️", enabled: false },
  { id: "counter", name: "Counter", emoji: "🔢", enabled: false },
  { id: "clock", name: "Clock", emoji: "🕐", enabled: false },
  { id: "container", name: "Container", emoji: "📦", enabled: false },
];

export function TimerTypeSelector({ open, onClose, onSelect }: TimerTypeSelectorProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F5F7FA] p-5 text-[#1A1A2E]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Select Timer Type</h2>
          <button type="button" onClick={onClose} className="btn-ghost rounded-md px-2.5 py-1 text-sm">
            Close
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {TIMER_TYPES.map((timerType) => (
            <button
              key={timerType.id}
              type="button"
              onClick={() => {
                if (!timerType.enabled) {
                  setToastMessage("Coming soon");
                  return;
                }

                onSelect(timerType.id);
              }}
              className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                timerType.enabled
                  ? "border-[#00E5C0]/60 bg-[#00E5C0]/12 text-[#1A1A2E] hover:bg-[#00E5C0]/20"
                  : "border-[rgba(0,0,0,0.08)] bg-white text-[#6B7280] hover:bg-[#f0f1f4]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">
                  {timerType.emoji} {timerType.name}
                </span>
                {timerType.enabled ? (
                  <span className="text-xs font-semibold text-[#0f8f7a]">Available</span>
                ) : (
                  <span className="rounded bg-[#E5E7EB] px-2 py-0.5 text-xs text-[#6B7280]">Coming soon</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {toastMessage ? (
          <p className="mt-4 rounded-md bg-[#1A1A2E] px-3 py-2 text-sm font-medium text-white">{toastMessage}</p>
        ) : null}
      </div>
    </div>
  );
}
