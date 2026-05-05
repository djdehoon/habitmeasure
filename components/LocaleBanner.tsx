import { UkFlag } from "@/components/UkFlag";

/** Full-width strip; use inside a centered section (breaks out to viewport width). */
export function LocaleBanner() {
  return (
    <div className="w-full shrink-0">
      <div
        className="relative left-1/2 w-[100vw] -translate-x-1/2 border-b border-slate-200/80 bg-[#F5F7FA] text-sm text-slate-600"
        role="status"
      >
        <div className="container-shell flex w-full flex-row items-center justify-center gap-2 py-2">
          <span>Soon available in English</span>
          <UkFlag className="h-3.5 w-7 shrink-0 overflow-hidden rounded-[2px] border border-slate-300/60 shadow-sm" />
        </div>
      </div>
    </div>
  );
}
