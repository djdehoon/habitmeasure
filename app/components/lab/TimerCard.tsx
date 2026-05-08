"use client";

import { useRouter } from "next/navigation";
import { formatDuration, type TimerTemplate } from "@/lib/utils/timerHelpers";
import { TimerDeleteButton } from "@/app/components/lab/TimerDeleteButton";

type TimerCardProps = {
  template: TimerTemplate;
};

export function TimerCard({ template }: TimerCardProps) {
  const router = useRouter();

  return (
    <article className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F5F7FA] p-4 text-[#1A1A2E]">
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
          onClick={() => router.push(`/lab?edit=${template.id}`)}
          className="rounded-md border border-[#E74C3C]/50 bg-white px-3 py-1.5 text-sm text-[#E74C3C] transition hover:bg-[#E74C3C]/10"
        >
          Edit
        </button>
        <TimerDeleteButton templateId={template.id} onDeleted={() => router.refresh()} />
      </div>
    </article>
  );
}
