import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TimerTemplate } from "@/lib/utils/timerHelpers";
import { TimerCard } from "@/app/components/lab/TimerCard";

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
        <TimerCard key={template.id} template={template} />
      ))}
    </div>
  );
}
