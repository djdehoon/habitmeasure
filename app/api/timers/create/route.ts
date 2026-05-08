import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type CreateTimerBody = {
  name?: string;
  duration?: number;
  color?: string;
  icon?: string;
};

export async function POST(request: Request) {
  let body: CreateTimerBody;

  try {
    body = (await request.json()) as CreateTimerBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const durationMinutes = Number(body.duration);
  const durationSeconds = Math.floor(durationMinutes * 60);
  const color = body.color ?? "#00E5C0";
  const icon = body.icon ?? "⏱️";

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return NextResponse.json({ error: "Duration must be greater than 0." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("timer_templates")
    .insert({
      user_id: user.id,
      template_name: name,
      timer_type: "countdown",
      duration_seconds: durationSeconds,
      color,
      icon,
      autocompletion: true,
      min_delay_seconds: 0,
      add_time_buttons: true,
      notes: "",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, template_id: data.id });
}
