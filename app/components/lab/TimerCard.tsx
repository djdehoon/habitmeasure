"use client";

import { useRouter } from "next/navigation";
import { formatIntervalSummary, type TimerTemplate } from "@/lib/utils/timerHelpers";
import { TimerDeleteButton } from "@/app/components/lab/TimerDeleteButton";

type TimerCardProps = {
  template: TimerTemplate;
};

export function TimerCard({ template }: TimerCardProps) {
  const router = useRouter();
  const openTimer = () => {
    router.push(`/lab/${template.id}`);
  };

  return (
    <article
      className="glass-panel cursor-pointer border border-white/10 p-4 text-slate-100 transition hover:border-emerald-400/40"
      onClick={openTimer}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openTimer();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open routine ${template.template_name}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="truncate text-lg font-semibold">{template.template_name}</h3>
        <span className="text-2xl leading-none">{template.icon}</span>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
        <span className="font-medium">{template.timer_type === "interval" ? "Morning session" : "Duration"}</span>
        <span className="text-base font-bold text-slate-100">{formatIntervalSummary(template)}</span>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-slate-400">Color</span>
        <span
          className="inline-block h-4 w-4 rounded-full border border-white/20"
          style={{ backgroundColor: template.color }}
          aria-label={`Routine color ${template.color}`}
        />
      </div>

      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            router.push(`/lab?edit=${template.id}`);
          }}
          className="rounded-md border border-red-400/40 bg-slate-950/80 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-500/10"
        >
          Edit
        </button>
        <div onClick={(event) => event.stopPropagation()}>
          <TimerDeleteButton templateId={template.id} onDeleted={() => router.refresh()} />
        </div>
      </div>
    </article>
  );
}
