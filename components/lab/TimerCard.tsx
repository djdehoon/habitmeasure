import { formatDuration, type TimerTemplate } from "@/lib/utils/timerHelpers";

type TimerCardProps = {
  template: TimerTemplate;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  isDeleting?: boolean;
};

export function TimerCard({ template, onEdit, onDelete, isDeleting = false }: TimerCardProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-[#171717] p-4 text-white shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="truncate text-lg font-semibold">{template.template_name}</h3>
        <span
          className="inline-block h-4 w-4 shrink-0 rounded-full border border-white/30"
          style={{ backgroundColor: template.color }}
          aria-label={`Kleur ${template.color}`}
        />
      </div>

      <p className="text-sm text-white/70">Countdown Timer</p>
      <p className="mt-1 text-2xl font-bold tracking-wide">{formatDuration(template.duration_seconds)}</p>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(template.id)}
          className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(template.id)}
          disabled={isDeleting}
          className="rounded-md border border-[#E74C3C]/60 px-3 py-1.5 text-sm text-[#E74C3C] transition hover:bg-[#E74C3C]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Deleting..." : "Del"}
        </button>
      </div>
    </article>
  );
}
