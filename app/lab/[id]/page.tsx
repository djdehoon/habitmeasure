import { redirect } from "next/navigation";
import { IntervalTimerCountdown } from "@/app/components/lab/IntervalTimerCountdown";
import { TimerDisplay } from "@/components/lab/TimerDisplay";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getIntervalActivities } from "@/lib/utils/intervalActivities";
import { hasValidIntervalConfig, type TimerTemplate } from "@/lib/utils/timerHelpers";

type LabTimerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LabTimerPage({ params }: LabTimerPageProps) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("timer_templates")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    redirect("/lab");
  }

  const timer = data as TimerTemplate;

  if (timer.timer_type === "countdown") {
    redirect(`/lab/countdown/${id}`);
  }

  const activities = getIntervalActivities(timer);
  const isInterval = timer.timer_type === "interval" && hasValidIntervalConfig(timer);

  if (isInterval) {
    return <IntervalTimerCountdown template={timer} />;
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-6">
      <TimerDisplay durationSeconds={timer.duration_seconds} timerName={timer.template_name} />
    </div>
  );
}
