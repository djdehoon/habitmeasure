"use client";

import { useRouter } from "next/navigation";
import { formatIntervalSummary, type TimerTemplate, type TimerType } from "@/lib/utils/timerHelpers";
import { TimerDeleteButton } from "@/app/components/lab/TimerDeleteButton";

const TYPE_LABEL: Record<TimerType, string> = {
  countdown: "Countdown",
  interval: "Interval",
};

type TimerCardEditProps = {
  template: TimerTemplate;
};

/** Management-focused card: summary + Edit / Delete (no whole-card navigation). */
export function TimerCardEdit({ template }: TimerCardEditProps) {
  const router = useRouter();

  return (
    <article className="glass-panel min-w-0 rounded-xl border border-white/10 p-5 text-slate-100">
      <div className="mb-3 text-center text-4xl leading-none" aria-hidden>
        {template.icon}
      </div>
      <h3 className="mb-1 min-w-0 break-words text-balance text-center text-lg font-semibold text-slate-100 [overflow-wrap:anywhere]">
        {template.template_name}
      </h3>
      <p className="mb-2 break-all text-center font-mono text-[10px] leading-snug text-slate-500 [overflow-wrap:anywhere]">
        {template.id}
      </p>
      <p className="mb-2 text-center text-xs text-slate-400">{TYPE_LABEL[template.timer_type]}</p>
      <div className="mb-3 flex items-center justify-center gap-2">
        <span className="text-sm text-slate-400">Color</span>
        <span
          className="inline-block h-4 w-4 shrink-0 rounded-full border border-white/20"
          style={{ backgroundColor: template.color?.trim() || "#00E5C0" }}
          aria-label={`Routine color ${template.color ?? ""}`}
        />
      </div>
      <p className="mb-4 text-center text-sm font-semibold text-emerald-400">{formatIntervalSummary(template)}</p>

      <div className="flex flex-wrap items-start justify-center gap-2">
        <button
          type="button"
          onClick={() => router.push(`/lab?edit=${template.id}`)}
          className="rounded-md border border-red-400/40 bg-slate-950/80 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-500/10"
        >
          Edit
        </button>
        <div>
          <TimerDeleteButton templateId={template.id} onDeleted={() => router.refresh()} />
        </div>
      </div>
    </article>
  );
}
