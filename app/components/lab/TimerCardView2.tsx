"use client";

import type { TimerTemplate } from "@/lib/utils/timerHelpers";

type TimerCardView2Props = {
  template: TimerTemplate;
};

/** Placeholder layout for an alternate lab card view (View 2). */
export function TimerCardView2({ template }: TimerCardView2Props) {
  return (
    <article className="rounded-xl border border-white/10 bg-slate-900/80 p-4 text-center text-slate-100">
      <div className="mb-3 text-3xl leading-none" aria-hidden>
        {template.icon}
      </div>
      <h3 className="truncate text-base font-semibold text-slate-100">{template.template_name}</h3>
      <p className="mt-2 text-xs text-slate-400">View 2 — coming soon</p>
      <p className="mt-3 text-xs text-slate-500">Placeholder for a future layout.</p>
    </article>
  );
}
