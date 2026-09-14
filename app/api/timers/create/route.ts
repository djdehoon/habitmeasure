import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { parseIntervalPayloadFromBody } from "@/lib/utils/parseIntervalApiBody";
import { normalizeAddTimeButtons } from "@/lib/utils/timerHelpers";

type CreateTimerBody = {
  name?: string;
  template_name?: string;
  duration?: number;
  duration_seconds?: number;
  durationMinutes?: number;
  durationSeconds?: number;
  color?: string;
  icon?: string;
  timerType?: string;
  timer_type?: string;
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
  activities?: unknown;
};

export async function POST(request: Request) {
  let body: CreateTimerBody;

  try {
    body = (await request.json()) as CreateTimerBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = (body.template_name ?? body.name ?? "").trim();
  const color = body.color ?? "#00E5C0";
  const icon = body.icon ?? "⏱️";
  const timerType = body.timer_type ?? body.timerType ?? "countdown";
  const autocompletion = body.autocompletion ?? true;
  const minDelaySeconds = Number(body.min_delay_seconds ?? body.minDelaySeconds ?? 5);
  const addTimeButtons = normalizeAddTimeButtons(body.add_time_buttons ?? body.addTimeButtons);
  const notes = typeof body.notes === "string" ? (body.notes.trim() || null) : null;

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
    const parsed = parseIntervalPayloadFromBody(body as Record<string, unknown>);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { duration_seconds, activities, work_seconds, rest_seconds, rounds } = parsed.payload;
    const intervalColor = body.color ?? "#E74C3C";

    const { data, error } = await supabase
      .from("timer_templates")
      .insert({
        user_id: user.id,
        template_name: name,
        timer_type: "interval",
        duration_seconds,
        color: intervalColor,
        icon,
        autocompletion,
        min_delay_seconds: minDelaySeconds,
        add_time_buttons: addTimeButtons,
        notes,
        work_seconds,
        rest_seconds,
        rounds,
        activities,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, template_id: data.id });
  }

  const durationFromDirectSeconds = Number(body.duration_seconds);
  const durationFromMinutesSeconds = Number(body.durationMinutes) * 60 + Number(body.durationSeconds);
  const durationFromMinutesOnly = Number(body.duration) * 60;
  const durationSeconds = Number.isFinite(durationFromDirectSeconds) && durationFromDirectSeconds > 0
    ? Math.floor(durationFromDirectSeconds)
    : Number.isFinite(durationFromMinutesSeconds) && durationFromMinutesSeconds > 0
      ? Math.floor(durationFromMinutesSeconds)
      : Math.floor(durationFromMinutesOnly);

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return NextResponse.json({ error: "Duration must be greater than 0." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("timer_templates")
    .insert({
      user_id: user.id,
      template_name: name,
      timer_type: timerType,
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
      activities: [],
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, template_id: data.id });
}
