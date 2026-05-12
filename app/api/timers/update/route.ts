import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { computeIntervalDurationSeconds, normalizeAddTimeButtons } from "@/lib/utils/timerHelpers";

type UpdateTimerBody = {
  templateId?: string;
  name?: string;
  template_name?: string;
  duration?: number;
  duration_seconds?: number;
  durationMinutes?: number;
  durationSeconds?: number;
  color?: string;
  icon?: string;
  timer_type?: string;
  timerType?: string;
  autocompletion?: boolean;
  minDelaySeconds?: number;
  min_delay_seconds?: number;
  addTimeButtons?: string[];
  add_time_buttons?: string[];
  notes?: string | null;
  work_seconds?: number;
  workSeconds?: number;
  rest_seconds?: number;
  restSeconds?: number;
  rounds?: number;
};

export async function PUT(request: Request) {
  let body: UpdateTimerBody;

  try {
    body = (await request.json()) as UpdateTimerBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const templateId = body.templateId?.trim() ?? "";
  const name = (body.template_name ?? body.name ?? "").trim();
  const timerType = body.timer_type ?? body.timerType ?? "countdown";

  if (!templateId) {
    return NextResponse.json({ error: "templateId is required." }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (timerType === "interval") {
    const work = Math.floor(Number(body.work_seconds ?? body.workSeconds ?? 0));
    const rest = Math.floor(Number(body.rest_seconds ?? body.restSeconds ?? 0));
    const rounds = Math.floor(Number(body.rounds ?? 0));

    if (!Number.isFinite(work) || work < 1) {
      return NextResponse.json({ error: "work_seconds must be at least 1." }, { status: 400 });
    }
    if (!Number.isFinite(rest) || rest < 1) {
      return NextResponse.json({ error: "rest_seconds must be at least 1." }, { status: 400 });
    }
    if (!Number.isFinite(rounds) || rounds < 1 || rounds > 999) {
      return NextResponse.json({ error: "rounds must be between 1 and 999." }, { status: 400 });
    }

    const durationSeconds = computeIntervalDurationSeconds(work, rest, rounds);
    if (durationSeconds < 1 || durationSeconds > 5999) {
      return NextResponse.json({ error: "Total duration must be between 1 and 5999 seconds." }, { status: 400 });
    }

    const icon = body.icon ?? "⏱️";
    const intervalColor = body.color ?? "#E74C3C";
    const autocompletion = body.autocompletion ?? true;
    const minDelaySeconds = Number(body.min_delay_seconds ?? body.minDelaySeconds ?? 5);
    const addTimeButtons = normalizeAddTimeButtons(body.add_time_buttons ?? body.addTimeButtons);

    const { data, error } = await supabase
      .from("timer_templates")
      .update({
        template_name: name,
        timer_type: "interval",
        duration_seconds: durationSeconds,
        color: intervalColor,
        icon,
        autocompletion,
        min_delay_seconds: minDelaySeconds,
        add_time_buttons: addTimeButtons,
        notes: typeof body.notes === "string" ? (body.notes.trim() || null) : null,
        work_seconds: work,
        rest_seconds: rest,
        rounds,
      })
      .eq("id", templateId)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, template: data });
  }

  const durationFromDirectSeconds = Number(body.duration_seconds);
  const durationFromMinutesSeconds = Number(body.durationMinutes) * 60 + Number(body.durationSeconds);
  const durationFromMinutesOnly = Number(body.duration) * 60;
  const durationSeconds = Number.isFinite(durationFromDirectSeconds) && durationFromDirectSeconds > 0
    ? Math.floor(durationFromDirectSeconds)
    : Number.isFinite(durationFromMinutesSeconds) && durationFromMinutesSeconds > 0
      ? Math.floor(durationFromMinutesSeconds)
      : Math.floor(durationFromMinutesOnly);
  const color = body.color ?? "#00E5C0";
  const icon = body.icon ?? "⏱️";
  const autocompletion = body.autocompletion ?? true;
  const minDelaySeconds = Number(body.min_delay_seconds ?? body.minDelaySeconds ?? 5);
  const addTimeButtons = normalizeAddTimeButtons(body.add_time_buttons ?? body.addTimeButtons);
  const notes = typeof body.notes === "string" ? (body.notes.trim() || null) : null;

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return NextResponse.json({ error: "Duration must be greater than 0." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("timer_templates")
    .update({
      template_name: name,
      timer_type: "countdown",
      duration_seconds: durationSeconds,
      color,
      icon,
      autocompletion,
      min_delay_seconds: minDelaySeconds,
      add_time_buttons: addTimeButtons,
      notes,
      work_seconds: null,
      rest_seconds: null,
      rounds: null,
    })
    .eq("id", templateId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, template: data });
}
