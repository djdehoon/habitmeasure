"use client";

import { useRouter } from "next/navigation";
import { formatDuration, type TimerTemplate } from "@/lib/utils/timerHelpers";
import { TimerDeleteButton } from "@/app/components/lab/TimerDeleteButton";

type TimerCardProps = {
  template: TimerTemplate;
};

export function TimerCard({ template }: TimerCardProps) {
  const router = useRouter();
  const openCountdown = () => {
    router.push(`/lab/countdown/${template.id}`);
  };

  return (
    <article
      className="cursor-pointer rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F5F7FA] p-4 text-[#1A1A2E] transition hover:border-[#00E5C0]/60"
      onClick={openCountdown}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openCountdown();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open timer ${template.template_name}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="truncate text-lg font-semibold">{template.template_name}</h3>
        <span className="text-2xl leading-none">{template.icon}</span>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-[#6B7280]">
        <span className="font-medium">Duration</span>
        <span className="text-base font-bold text-[#1A1A2E]">{formatDuration(template.duration_seconds)}</span>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-[#6B7280]">Color</span>
        <span
          className="inline-block h-4 w-4 rounded-full border border-black/15"
          style={{ backgroundColor: template.color }}
          aria-label={`Timer color ${template.color}`}
        />
      </div>

      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            router.push(`/lab?edit=${template.id}`);
          }}
          className="rounded-md border border-[#E74C3C]/50 bg-white px-3 py-1.5 text-sm text-[#E74C3C] transition hover:bg-[#E74C3C]/10"
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
