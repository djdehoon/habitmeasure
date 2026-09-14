import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeGroupName } from "@/lib/utils/timerHelpers";

type ReorderItem = {
  id?: string;
  group_name?: string;
  sort_order?: number;
};

type ReorderBody = {
  items?: ReorderItem[];
};

export async function PUT(request: Request) {
  let body: ReorderBody;

  try {
    body = (await request.json()) as ReorderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ error: "items array is required." }, { status: 400 });
  }

  const items = rawItems.map((item) => ({
    id: (item.id ?? "").trim(),
    group_name: normalizeGroupName(item.group_name),
    sort_order: Math.max(0, Math.floor(Number(item.sort_order) || 0)),
  }));

  if (items.some((item) => !item.id)) {
    return NextResponse.json({ error: "Each item needs an id." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  for (const item of items) {
    const { error } = await supabase
      .from("timer_templates")
      .update({
        group_name: item.group_name,
        sort_order: item.sort_order,
      })
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
