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
      <div className="rounded-xl border border-white/10 bg-slate-900/50 py-12 text-center text-lg text-slate-300">
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
    return <p className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error.message}</p>;
  }

  const templates = (data as TimerTemplate[]) ?? [];

  if (templates.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/50 py-12 text-center text-lg text-slate-400">
        No routines yet
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
