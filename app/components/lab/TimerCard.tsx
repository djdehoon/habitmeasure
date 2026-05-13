"use client";

import { useRouter } from "next/navigation";
import { formatIntervalSummary, type TimerTemplate, type TimerType } from "@/lib/utils/timerHelpers";
import { TimerDeleteButton } from "@/app/components/lab/TimerDeleteButton";

const TIMER_TYPE_BADGES: Record<
  TimerType,
  { icon: string; label: string; tone: string }
> = {
  countdown: {
    icon: "⏱️",
    label: "Countdown",
    tone: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  },
  interval: {
    icon: "🔄",
    label: "Interval",
    tone: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  },
};

function TimerTypeBadge({ timerType }: { timerType: TimerType }) {
  const cfg = TIMER_TYPE_BADGES[timerType];
  return (
    <div
      className={`pointer-events-none absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${cfg.tone}`}
      aria-hidden
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </div>
  );
}

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
      className="glass-panel relative cursor-pointer border border-white/10 p-4 text-slate-100 transition hover:border-emerald-400/40"
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
      <TimerTypeBadge timerType={template.timer_type} />

      <div className="mb-3 flex items-center justify-between gap-3 pr-24">
        <h3 className="truncate text-lg font-semibold">{template.icon} {template.template_name}</h3>
{/*        <span className="shrink-0 text-2xl leading-none">{template.icon}</span>
*/}      </div>

      

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-slate-400">Color</span>
        <span
          className="inline-block h-4 w-4 rounded-full border border-white/20"
          style={{ backgroundColor: template.color }}
          aria-label={`Routine color ${template.color}`}
        ></span>
        <span className="ml-auto text-base font-bold text-slate-100">{formatIntervalSummary(template)}</span>
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
