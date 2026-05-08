import { TIMER_TYPE_OPTIONS } from "@/lib/utils/timerHelpers";

type AddTimerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelectCountdown: () => void;
};

export function AddTimerModal({ open, onClose, onSelectCountdown }: AddTimerModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-xl border border-white/15 bg-[#121212] p-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Timer</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/20 px-2.5 py-1 text-sm hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TIMER_TYPE_OPTIONS.map((timerType) => {
            const disabled = !timerType.enabled;
            return (
              <button
                key={timerType.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (timerType.id === "countdown") onSelectCountdown();
                }}
                className={`rounded-lg border px-4 py-3 text-left transition ${
                  disabled
                    ? "cursor-not-allowed border-white/10 bg-white/5 opacity-55"
                    : "border-[#00E5C0]/60 bg-[#00E5C0]/10 hover:bg-[#00E5C0]/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">
                    {timerType.emoji} {timerType.name}
                  </span>
                  {disabled ? (
                    <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/80">Coming soon</span>
                  ) : (
                    <span className="text-xs font-semibold text-[#00E5C0]">Available</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
