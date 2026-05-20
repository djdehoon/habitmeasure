import type { TimerSessionRow } from "@/app/lib/types";

/** Match progress ring width on fullscreen countdown. */
export const countdownRingColumnWidth = "w-full max-w-[min(92vw,22rem)]";

export const premiumCard =
  "rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors";

export const premiumCardInteractive = `${premiumCard} hover:bg-white/[0.07]`;

export const premiumTabBar = "flex w-full rounded-lg border border-white/10 bg-white/5 p-0.5";

export const premiumTabActive =
  "flex-1 rounded-md border border-white/15 bg-white/10 py-1.5 text-xs font-semibold tracking-wide text-slate-100 transition-colors";

export const premiumTabInactive =
  "flex-1 rounded-md py-1.5 text-xs font-semibold tracking-wide text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300";

export const premiumLabel =
  "text-[11px] font-medium uppercase tracking-wider text-slate-500";

export const premiumValue = "mt-1 text-sm font-semibold text-slate-100";

export const premiumMuted = "text-center text-xs text-slate-400";

const premiumBadgeBase =
  "rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide";

export function premiumStatusBadge(status: TimerSessionRow["status"]): string {
  switch (status) {
    case "completed":
      return `${premiumBadgeBase} border-emerald-400/25 bg-emerald-500/20 text-emerald-300`;
    case "cancelled":
      return `${premiumBadgeBase} border-slate-400/20 bg-slate-500/20 text-slate-400`;
    case "paused":
      return `${premiumBadgeBase} border-amber-400/25 bg-amber-500/20 text-amber-300`;
    default:
      return `${premiumBadgeBase} border-sky-400/25 bg-sky-500/20 text-sky-300`;
  }
}
