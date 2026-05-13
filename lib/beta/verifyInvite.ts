import { devLog } from "@/lib/utils/logger";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function normalizeInviteCode(raw: string | null | undefined): string {
  return (raw ?? "").trim().toUpperCase();
}

export async function checkInviteCodeValidWithClient(
  supabase: SupabaseClient,
  code: string,
): Promise<boolean> {
  const normalized = normalizeInviteCode(code);
  if (!normalized) {
    devLog("❌ Code is empty");
    return false;
  }

  devLog("📡 Querying beta_testers table...");

  const { data, error } = await supabase
    .from("beta_testers")
    .select("id, invite_code, status, expires_at, use_count, max_uses")
    .eq("invite_code", normalized)
    .maybeSingle();

  devLog("📊 Query result:", { data, error });
  devLog("📊 Data keys:", data ? Object.keys(data) : "no data");

  if (error) {
    console.error("❌ Error:", error);
    return false;
  }

  if (!data || !data.id) {
    devLog("❌ No data found");
    return false;
  }

  if (data.expires_at && new Date(data.expires_at as string) < new Date()) {
    devLog("❌ Code expired:", data.expires_at);
    return false;
  }

  devLog("✅ Code is valid!");
  return true;
}

export async function checkInviteCodeValid(code: string): Promise<boolean> {
  const normalized = normalizeInviteCode(code);
  devLog("🔍 Normalized code:", normalized);

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  devLog("🔐 Service Role Key exists:", !!serviceRoleKey);
  devLog("🔐 Supabase URL:", supabaseUrl);

  if (!serviceRoleKey || !supabaseUrl) {
    console.error("❌ Missing env vars!");
    return false;
  }

  if (!normalized) {
    devLog("❌ Code is empty");
    return false;
  }

  const supabase = getBetaInviteServiceClient();
  if (!supabase) {
    console.error("❌ Missing env vars!");
    return false;
  }

  return checkInviteCodeValidWithClient(supabase, normalized);
}

export function getBetaInviteServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
