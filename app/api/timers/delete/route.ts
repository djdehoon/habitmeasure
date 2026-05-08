import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type DeleteTimerBody = {
  templateId?: string;
};

export async function DELETE(request: Request) {
  let body: DeleteTimerBody;

  try {
    body = (await request.json()) as DeleteTimerBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const templateId = body.templateId?.trim() ?? "";
  if (!templateId) {
    return NextResponse.json({ error: "templateId is required." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { error } = await supabase.from("timer_templates").delete().eq("id", templateId).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
