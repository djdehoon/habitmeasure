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
    <article className="glass-panel rounded-xl border border-white/10 p-4 text-slate-100">
      <div className="mb-3 text-center text-4xl leading-none" aria-hidden>
        {template.icon}
      </div>
      <h3 className="mb-1 truncate text-center text-lg font-semibold text-slate-100">{template.template_name}</h3>
      <p className="mb-2 text-center text-xs text-slate-400">{TYPE_LABEL[template.timer_type]}</p>
      <p className="mb-4 text-center text-sm font-semibold text-emerald-400">{formatIntervalSummary(template)}</p>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <button
          type="button"
          onClick={() => router.push(`/lab?edit=${template.id}`)}
          className="flex-1 rounded-lg bg-emerald-500 px-3 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
        >
          Edit
        </button>
        <div className="flex-1">
          <TimerDeleteButton templateId={template.id} onDeleted={() => router.refresh()} variant="prominent" />
        </div>
      </div>
    </article>
  );
}
