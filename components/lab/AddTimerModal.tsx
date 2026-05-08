import { TIMER_TYPE_OPTIONS } from "@/lib/utils/timerHelpers";

type AddTimerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelectCountdown: () => void;
};

export function AddTimerModal({ open, onClose, onSelectCountdown }: AddTimerModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-xl rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F5F7FA] p-5 text-[#1A1A2E]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Timer</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost rounded-md px-2.5 py-1 text-sm"
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
                    ? "cursor-not-allowed border-[rgba(0,0,0,0.08)] bg-white text-[#6B7280] opacity-70"
                    : "border-[#00E5C0]/60 bg-[#00E5C0]/12 text-[#1A1A2E] hover:bg-[#00E5C0]/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">
                    {timerType.emoji} {timerType.name}
                  </span>
                  {disabled ? (
                    <span className="rounded bg-[#E5E7EB] px-2 py-0.5 text-xs text-[#6B7280]">Coming soon</span>
                  ) : (
                    <span className="text-xs font-semibold text-[#0f8f7a]">Available</span>
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
