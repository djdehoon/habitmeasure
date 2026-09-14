"use client";

import { useRouter } from "next/navigation";
import {
  formatIntervalSummary,
  getTimerHref,
  type TimerTemplate,
  type TimerType,
} from "@/lib/utils/timerHelpers";

const TYPE_LABEL: Record<TimerType, string> = {
  countdown: "Countdown",
  interval: "Interval",
};

const TYPE_GLYPH: Record<TimerType, string> = {
  countdown: "⏱",
  interval: "↻",
};

type TimerCardOverviewProps = {
  template: TimerTemplate;
  arrangeMode?: boolean;
  dragging?: boolean;
  onDragStart?: (templateId: string) => void;
  onDragEnd?: () => void;
  onDropOnCard?: (templateId: string) => void;
};

export function TimerCardOverview({
  template,
  arrangeMode = false,
  dragging = false,
  onDragStart,
  onDragEnd,
  onDropOnCard,
}: TimerCardOverviewProps) {
  const router = useRouter();
  const href = getTimerHref(template);
  const color = template.color?.trim() || "#00E5C0";
  const canOpen = Boolean(href) && !arrangeMode;

  const open = () => {
    if (!href || arrangeMode) return;
    router.push(href);
  };

  return (
    <article
      className={`relative min-w-0 rounded-xl border border-white/10 bg-slate-900/80 p-4 text-slate-100 transition ${
        canOpen ? "cursor-pointer hover:border-emerald-400/40 focus-within:border-emerald-400/40" : ""
      } ${arrangeMode ? "cursor-grab active:cursor-grabbing" : ""} ${dragging ? "opacity-50" : ""}`}
      style={{ boxShadow: `inset 3px 0 0 0 ${color}` }}
      onClick={canOpen ? open : undefined}
      onKeyDown={
        canOpen
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                open();
              }
            }
          : undefined
      }
      role={canOpen ? "button" : arrangeMode ? "listitem" : undefined}
      tabIndex={canOpen ? 0 : undefined}
      aria-label={
        canOpen
          ? `Open ${template.template_name}`
          : arrangeMode
            ? `${template.template_name}, drag to rearrange`
            : template.template_name
      }
      draggable={arrangeMode}
      onDragStart={(event) => {
        if (!arrangeMode) return;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", template.id);
        onDragStart?.(template.id);
      }}
      onDragEnd={() => onDragEnd?.()}
      onDragOver={(event) => {
        if (!arrangeMode) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        if (!arrangeMode) return;
        event.preventDefault();
        event.stopPropagation();
        onDropOnCard?.(template.id);
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-3xl leading-none" aria-hidden>
          {template.icon}
        </span>
        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-3xl leading-none" aria-hidden>
            {TYPE_GLYPH[template.timer_type]}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {TYPE_LABEL[template.timer_type]}
          </span>
        </div>
      </div>

      <h3 className="mb-1 min-w-0 break-words text-balance text-base font-semibold text-slate-100 [overflow-wrap:anywhere]">
        {template.template_name}
      </h3>
      <p className="mb-2 text-sm font-semibold" style={{ color }}>
        {formatIntervalSummary(template)}
      </p>

      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
          Ready
        </span>
        {canOpen ? (
          <span className="text-sm text-slate-400" aria-hidden>
            Open →
          </span>
        ) : arrangeMode ? (
          <span className="text-xs text-slate-500" aria-hidden>
            Drag
          </span>
        ) : null}
      </div>
    </article>
  );
}
