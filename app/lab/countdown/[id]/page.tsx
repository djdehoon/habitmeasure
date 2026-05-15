import { redirect } from "next/navigation";
import { CountdownExecution } from "@/app/components/lab/CountdownExecution";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TimerTemplate } from "@/lib/utils/timerHelpers";

type CountdownPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CountdownTimerPage({ params }: CountdownPageProps) {
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

  if (timer.timer_type !== "countdown") {
    redirect(`/lab/${id}`);
  }

  return <CountdownExecution template={timer} />;
}
