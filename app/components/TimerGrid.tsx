import Link from "next/link";
import type { ComponentType } from "react";
import { getSupabaseServerClient, getServerUser } from "@/lib/supabase/server";
import { formatDuration, type TimerTemplate } from "@/lib/utils/timerHelpers";

type DeleteButtonProps = {
  templateId: string;
  className?: string;
};

type TimerGridProps = {
  DeleteButton: ComponentType<DeleteButtonProps>;
};

export default async function TimerGrid({ DeleteButton }: TimerGridProps) {
  const { user } = await getServerUser();

  if (!user) {
    return (
      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F5F7FA] p-6 text-[#6B7280]">
        Log in om je timers te bekijken.
      </div>
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("timer_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="rounded-md bg-[#E74C3C]/15 p-3 text-sm text-[#b2372b]">{error.message}</p>;
  }

  const templates = (data as TimerTemplate[]) ?? [];

  if (templates.length === 0) {
    return (
      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F5F7FA] py-12 text-center text-lg text-[#6B7280]">
        Nog geen timers. Maak er een!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <article key={template.id} className="card-shell rounded-xl bg-[#F5F7FA] p-4 text-[#1A1A2E] shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="truncate text-lg font-semibold">{template.template_name}</h3>
            <span
              className="inline-block h-4 w-4 shrink-0 rounded-full border border-black/15"
              style={{ backgroundColor: template.color }}
              aria-label={`Kleur ${template.color}`}
            />
          </div>

          <p className="text-sm text-[#6B7280]">Countdown Timer</p>
          <p className="mt-1 text-2xl font-bold tracking-wide">{formatDuration(template.duration_seconds)}</p>

          <div className="mt-4 flex items-center gap-2">
            <Link href={`/lab/countdown/setup?id=${template.id}`} className="btn-ghost rounded-md px-3 py-1.5 text-sm">
              Edit
            </Link>
            <DeleteButton templateId={template.id} />
          </div>
        </article>
      ))}
    </div>
  );
}
