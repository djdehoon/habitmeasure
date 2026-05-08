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
            aria-label={`Selecteer kleur ${color}`}
            onClick={() => onChange(color)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
              selected ? "border-[#1A1A2E]" : "border-[rgba(0,0,0,0.15)]"
            }`}
            style={{ backgroundColor: color }}
          >
            {selected ? <span className="text-xs text-black">✓</span> : null}
          </button>
        );
      })}
    </div>
  );
}
