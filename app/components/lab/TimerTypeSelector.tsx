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
  subtitle?: string;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-slate-900 p-5 text-slate-100 shadow-xl shadow-black/40">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">Select timer type</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2.5 py-1 text-sm text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
          >
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
                  ? "border-emerald-400/50 bg-emerald-500/10 text-slate-100 hover:bg-emerald-500/20"
                  : "border-white/10 bg-slate-950/80 text-slate-500 hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="font-medium">
                    {timerType.emoji} {timerType.name}
                  </span>
                  {timerType.subtitle ? (
                    <p className="mt-0.5 text-xs leading-snug text-slate-400">{timerType.subtitle}</p>
                  ) : null}
                </div>
                {timerType.enabled ? (
                  <span className="shrink-0 text-xs font-semibold text-emerald-300">Available</span>
                ) : (
                  <span className="shrink-0 rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">Coming soon</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {toastMessage ? (
          <p className="mt-4 rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-100">
            {toastMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
