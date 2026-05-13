"use client";

import { useRouter } from "next/navigation";
import { formatIntervalSummary, type TimerTemplate, type TimerType } from "@/lib/utils/timerHelpers";
import { TimerCardIntervalRunning } from "@/app/components/lab/TimerCardIntervalRunning";
import { TimerCardRunning } from "@/app/components/lab/TimerCardRunning";

function hasValidIntervalFields(t: TimerTemplate): boolean {
  if (t.timer_type !== "interval") return false;
  const work = Number(t.work_seconds);
  const rest = Number(t.rest_seconds);
  const rounds = Number(t.rounds);
  return (
    Number.isFinite(work) &&
    work > 0 &&
    Number.isFinite(rest) &&
    rest > 0 &&
    Number.isFinite(rounds) &&
    rounds > 0
  );
}

const TYPE_LABEL: Record<TimerType, string> = {
  countdown: "Countdown",
  interval: "Interval",
};

export function TimerCardCompact({ template }: { template: TimerTemplate }) {
  const router = useRouter();
  const go = () => {
    router.push(`/lab/${template.id}`);
  };

  if (template.timer_type === "countdown") {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5 text-slate-100 transition hover:border-emerald-400/40">
        <div className="mb-2 text-3xl leading-none" aria-hidden>
          {template.icon}
        </div>
        <h3 className="mb-1 truncate font-semibold text-slate-100">{template.template_name}</h3>
        <p className="mb-2 text-xs text-slate-400">{TYPE_LABEL[template.timer_type]}</p>
        <p className="mb-3 text-sm font-bold text-emerald-400">{formatIntervalSummary(template)}</p>
        <TimerCardRunning template={template} />
      </div>
    );
  }

  if (hasValidIntervalFields(template)) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5 text-slate-100 transition hover:border-emerald-400/40">
        <div className="mb-2 text-3xl leading-none" aria-hidden>
          {template.icon}
        </div>
        <h3 className="mb-1 truncate font-semibold text-slate-100">{template.template_name}</h3>
        <p className="mb-2 text-xs text-slate-400">{TYPE_LABEL[template.timer_type]}</p>
        <p className="mb-3 text-sm font-bold text-emerald-400">{formatIntervalSummary(template)}</p>
        <TimerCardIntervalRunning template={template} />
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer rounded-xl border border-white/10 bg-slate-900/80 p-5 text-slate-100 transition hover:border-emerald-400/40"
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
