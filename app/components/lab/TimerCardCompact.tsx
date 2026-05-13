"use client";

import { useRouter } from "next/navigation";
import { formatIntervalSummary, type TimerTemplate, type TimerType } from "@/lib/utils/timerHelpers";

const TYPE_LABEL: Record<TimerType, string> = {
  countdown: "Countdown",
  interval: "Interval",
};

export function TimerCardCompact({ template }: { template: TimerTemplate }) {
  const router = useRouter();
  const go = () => {
    router.push(`/lab/${template.id}`);
  };

  return (
    <div
      className="cursor-pointer rounded-xl border border-white/10 bg-slate-900/80 p-4 text-slate-100 transition hover:border-emerald-400/40"
      onClick={go}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          go();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open routine ${template.template_name}`}
    >
      <div className="mb-2 text-3xl leading-none" aria-hidden>
        {template.icon}
      </div>
      <h3 className="mb-1 truncate font-semibold text-slate-100">{template.template_name}</h3>
      <p className="mb-2 text-xs text-slate-400">{TYPE_LABEL[template.timer_type]}</p>
      <p className="text-sm font-bold text-emerald-400">{formatIntervalSummary(template)}</p>
    </div>
  );
}
