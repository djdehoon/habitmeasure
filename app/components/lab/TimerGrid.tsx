import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDuration, type TimerTemplate } from "@/lib/utils/timerHelpers";
import { TimerDeleteAction } from "@/app/components/lab/TimerDeleteAction";

export default async function TimerGrid() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F5F7FA] py-12 text-center text-lg text-[#6B7280]">
        Please log in
      </div>
    );
  }

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
        No timers yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <article key={template.id} className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F5F7FA] p-4 text-[#1A1A2E]">
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

          <TimerDeleteAction templateId={template.id} />
        </article>
      ))}
    </div>
  );
}
