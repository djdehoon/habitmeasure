import { formatDuration, type TimerTemplate } from "@/lib/utils/timerHelpers";

type TimerCardProps = {
  template: TimerTemplate;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  isDeleting?: boolean;
};

export function TimerCard({ template, onEdit, onDelete, isDeleting = false }: TimerCardProps) {
  return (
    <article className="card-shell rounded-xl bg-[#F5F7FA] p-4 text-[#1A1A2E] shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="truncate text-lg font-semibold">{template.template_name}</h3>
        <span
          className="inline-block h-4 w-4 shrink-0 rounded-full border border-black/15"
          style={{ backgroundColor: template.color }}
          aria-label={`Kleur ${template.color}`}
        />
      </div>

      <p className="text-sm text-[#6B7280]">Countdown Timer</p>
      <p className="mt-1 text-2xl font-bold tracking-wide">{formatDuration(template.duration_seconds)}</p>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(template.id)}
          className="btn-ghost rounded-md px-3 py-1.5 text-sm"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(template.id)}
          disabled={isDeleting}
          className="rounded-md border border-[#E74C3C]/50 bg-white px-3 py-1.5 text-sm text-[#E74C3C] transition hover:bg-[#E74C3C]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Deleting..." : "Del"}
        </button>
      </div>
    </article>
  );
}
