import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const TERMINAL_STATUSES = new Set(["completed", "cancelled"]);

function getServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
}

type PostBody = { template_id?: string };
type PatchBody = { session_id?: string; status?: string };

export async function POST(request: Request) {
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 503 });
  }

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const templateId = body.template_id?.trim() ?? "";
  if (!templateId) {
    return NextResponse.json({ error: "template_id is required." }, { status: 400 });
  }

  const token = bearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: template, error: templateError } = await supabase
    .from("timer_templates")
    .select("id")
    .eq("id", templateId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (templateError || !template) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("timer_sessions")
    .insert({
      user_id: user.id,
      template_id: templateId,
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select("id, started_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    session_id: data.id,
    started_at: data.started_at,
  });
}

export async function PATCH(request: Request) {
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 503 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sessionId = body.session_id?.trim() ?? "";
  const status = body.status?.trim() ?? "";

  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required." }, { status: 400 });
  }

  const allowed = new Set(["running", "paused", "completed", "cancelled"]);
  if (!allowed.has(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const token = bearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("timer_sessions")
    .select("id, started_at, status")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  if (TERMINAL_STATUSES.has(existing.status)) {
    return NextResponse.json({ error: "Session is already closed." }, { status: 409 });
  }

  const patch: Record<string, unknown> = { status };

  if (TERMINAL_STATUSES.has(status)) {
    const started = new Date(existing.started_at as string).getTime();
    const durationSeconds = Math.max(0, Math.floor((Date.now() - started) / 1000));
    patch.completed_at = new Date().toISOString();
    patch.duration_seconds = durationSeconds;
  }

  const { data, error } = await supabase
    .from("timer_sessions")
    .update(patch)
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, session: data });
}
