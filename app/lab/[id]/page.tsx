import Link from "next/link";
import { redirect } from "next/navigation";
import { IntervalTimerCountdown } from "@/app/components/lab/IntervalTimerCountdown";
import { TimerDisplay } from "@/components/lab/TimerDisplay";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TimerTemplate } from "@/lib/utils/timerHelpers";

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

  const work = Number(timer.work_seconds);
  const rest = Number(timer.rest_seconds);
  const rounds = Number(timer.rounds);
  const isInterval =
    timer.timer_type === "interval" && Number.isFinite(work) && work > 0 && Number.isFinite(rest) && rest > 0 && Number.isFinite(rounds) && rounds > 0;

  const heading = isInterval ? "Interval Timer" : "Countdown Timer";

  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-center px-4 py-6">
        <Link href="/lab" className="absolute left-4 text-sm font-medium text-[#6B7280] transition hover:text-[#1A1A2E]">
          ← Back
        </Link>
        <h1 className="heading-font text-center text-xl font-bold text-[#1A1A2E] md:text-2xl">{heading}</h1>
      </header>

      {isInterval ? (
        <IntervalTimerCountdown
          templateId={timer.id}
          templateName={timer.template_name}
          workSeconds={work}
          restSeconds={rest}
          rounds={rounds}
        />
      ) : (
        <TimerDisplay durationSeconds={timer.duration_seconds} timerName={timer.template_name} />
      )}
    </div>
  );
}
