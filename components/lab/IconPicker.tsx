import { TIMER_ICONS } from "@/lib/utils/timerHelpers";

type IconPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIMER_ICONS.map((icon) => {
        const selected = value === icon;
        return (
          <button
            key={icon}
            type="button"
            onClick={() => onChange(icon)}
            className={`h-10 w-10 rounded-md border text-lg ${
              selected
                ? "border-[#00E5C0] bg-[#00E5C0]/20 text-[#1A1A2E]"
                : "border-[rgba(0,0,0,0.12)] bg-white text-[#1A1A2E]"
            }`}
            aria-label={`Selecteer icon ${icon}`}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
