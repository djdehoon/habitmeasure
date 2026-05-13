import { TIMER_COLORS } from "@/lib/utils/timerHelpers";

type ColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIMER_COLORS.map((color) => {
        const selected = value === color;
        return (
          <button
            key={color}
            type="button"
            aria-label={`Select color ${color}`}
            onClick={() => onChange(color)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
              selected ? "border-white ring-2 ring-white/30" : "border-white/20"
            }`}
            style={{ backgroundColor: color }}
          >
            {selected ? <span className="text-xs text-white drop-shadow">✓</span> : null}
          </button>
        );
      })}
    </div>
  );
}
