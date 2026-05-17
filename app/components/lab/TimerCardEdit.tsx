"use client";

import { useRouter } from "next/navigation";
import {
  formatIntervalSummary,
  getTimerFullscreenHref,
  type TimerTemplate,
  type TimerType,
} from "@/lib/utils/timerHelpers";
import { TimerDeleteButton } from "@/app/components/lab/TimerDeleteButton";

const TYPE_LABEL: Record<TimerType, string> = {
  countdown: "Countdown",
  interval: "Interval",
};

type TimerCardEditProps = {
  template: TimerTemplate;
};

/** Management-focused card: summary + Edit / Delete; body opens fullscreen when available. */
export function TimerCardEdit({ template }: TimerCardEditProps) {
  const router = useRouter();
  const fullscreenHref = getTimerFullscreenHref(template);

  const openFullscreen = () => {
    if (fullscreenHref) router.push(fullscreenHref);
  };

  return (
    <article
      className={`glass-panel flex min-w-0 flex-col rounded-xl border border-white/10 p-5 text-slate-100 ${
        fullscreenHref ? "cursor-pointer transition hover:border-emerald-400/40" : ""
      }`}
      onClick={fullscreenHref ? openFullscreen : undefined}
      onKeyDown={
        fullscreenHref
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openFullscreen();
              }
            }
          : undefined
      }
      role={fullscreenHref ? "button" : undefined}
      tabIndex={fullscreenHref ? 0 : undefined}
      aria-label={fullscreenHref ? `Open ${template.template_name} in full screen` : undefined}
    >
      <h3 className="order-1 mb-1 min-w-0 break-words text-balance text-center text-lg font-semibold text-slate-100 [overflow-wrap:anywhere] sm:order-2 sm:mb-1">
        {template.template_name}
      </h3>
      <p className="order-2 mb-0 break-all text-center font-mono text-[10px] leading-tight text-slate-500 [overflow-wrap:anywhere] sm:order-3 sm:mb-2 sm:leading-snug">
        {template.id}
      </p>
      <div
        className="order-3 mb-2 mt-0 text-center text-4xl leading-none sm:order-1 sm:mb-3 sm:mt-0"
        aria-hidden
      >
        {template.icon}
      </div>
      <p className="order-4 mb-2 text-center text-xs text-slate-400 sm:order-4">{TYPE_LABEL[template.timer_type]}</p>
      <div className="order-5 mb-3 flex items-center justify-center gap-2 sm:order-5">
        <span className="text-sm text-slate-400">Color</span>
        <span
          className="inline-block h-4 w-4 shrink-0 rounded-full border border-white/20"
          style={{ backgroundColor: template.color?.trim() || "#00E5C0" }}
          aria-label={`Routine color ${template.color ?? ""}`}
        />
      </div>
      <p className="order-6 mb-4 text-center text-sm font-semibold text-emerald-400 sm:order-6">
        {formatIntervalSummary(template)}
      </p>

      <div className="order-7 flex flex-wrap items-start justify-center gap-2 sm:order-7">
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
