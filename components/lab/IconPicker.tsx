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
                ? "border-emerald-400 bg-emerald-500/15 text-slate-100"
                : "border-white/15 bg-slate-950 text-slate-100 hover:bg-slate-800/80"
            }`}
            aria-label={`Select icon ${icon}`}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
