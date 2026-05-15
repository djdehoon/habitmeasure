"use client";

const PRESETS = [5, 10, 15, 30, 60] as const;

type DelayedStartModalProps = {
  open: boolean;
  defaultDelay: number;
  onClose: () => void;
  onConfirm: (delaySeconds: number) => void;
};

export function DelayedStartModal({ open, defaultDelay, onClose, onConfirm }: DelayedStartModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delayed-start-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="delayed-start-title" className="text-lg font-semibold text-slate-100">
          Delayed start
        </h2>
        <p className="mt-1 text-sm text-slate-400">Count down before the timer begins.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => {
                onConfirm(seconds);
                onClose();
              }}
              className={`min-h-11 rounded-lg px-4 py-2 text-sm font-medium transition ${
                seconds === defaultDelay
                  ? "bg-sky-500 text-white"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
