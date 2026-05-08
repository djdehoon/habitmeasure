type DurationPickerProps = {
  minutes: number;
  seconds: number;
  onMinutesChange: (value: number) => void;
  onSecondsChange: (value: number) => void;
};

export function DurationPicker({ minutes, seconds, onMinutesChange, onSecondsChange }: DurationPickerProps) {
  return (
    <div className="flex items-end gap-3">
      <label className="flex flex-col gap-1 text-sm text-[#6B7280]">
        min
        <input
          type="number"
          min={0}
          max={99}
          value={minutes}
          onChange={(event) => onMinutesChange(Number(event.target.value))}
          className="w-20 rounded-md border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 text-[#1A1A2E]"
        />
      </label>
      <span className="pb-2 text-xl font-bold text-[#1A1A2E]">:</span>
      <label className="flex flex-col gap-1 text-sm text-[#6B7280]">
        sec
        <input
          type="number"
          min={0}
          max={59}
          value={seconds}
          onChange={(event) => onSecondsChange(Number(event.target.value))}
          className="w-20 rounded-md border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 text-[#1A1A2E]"
        />
      </label>
    </div>
  );
}
