import { devLog } from "@/lib/utils/logger";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function normalizeInviteCode(raw: string | null | undefined): string {
  return (raw ?? "").trim().toUpperCase();
}

export type InviteInvalidReason =
  | "empty"
  | "missing_env"
  | "query_error"
  | "not_found"
  | "expired"
  | "revoked"
  | "exhausted";

export type InviteValidationResult = { valid: true } | { valid: false; reason: InviteInvalidReason; detail?: string };

function logInvalid(reason: InviteInvalidReason, detail?: string) {
  const msg = detail ? `beta invite invalid: ${reason} (${detail})` : `beta invite invalid: ${reason}`;
  console.error(msg);
  devLog(`❌ ${msg}`);
}

export async function checkInviteCodeValidWithClient(
  supabase: SupabaseClient,
  code: string,
): Promise<InviteValidationResult> {
  const normalized = normalizeInviteCode(code);
  if (!normalized) {
    logInvalid("empty");
    return { valid: false, reason: "empty" };
  }

  devLog("📡 Querying beta_testers table...");

  const { data, error } = await supabase
    .from("beta_testers")
    .select("id, invite_code, expires_at, revoked_at, use_count, max_uses")
    .eq("invite_code", normalized)
    .maybeSingle();

  devLog("📊 Query result:", { data, error });
  devLog("📊 Data keys:", data ? Object.keys(data) : "no data");

  if (error) {
    const detail = error.message ?? String(error);
    logInvalid("query_error", detail);
    return { valid: false, reason: "query_error", detail };
  }

  if (!data || !data.id) {
    logInvalid("not_found", normalized);
    return { valid: false, reason: "not_found", detail: normalized };
  }

  if (data.expires_at && new Date(data.expires_at as string) < new Date()) {
    logInvalid("expired", String(data.expires_at));
    return { valid: false, reason: "expired", detail: String(data.expires_at) };
  }

  if (data.revoked_at) {
    logInvalid("revoked", String(data.revoked_at));
    return { valid: false, reason: "revoked", detail: String(data.revoked_at) };
  }

  const useCount = Number(data.use_count) || 0;
  const maxUses = Number(data.max_uses) || 1;
  if (useCount >= maxUses) {
    logInvalid("exhausted", `${useCount}/${maxUses}`);
    return { valid: false, reason: "exhausted", detail: `${useCount}/${maxUses}` };
  }

  devLog("✅ Code is valid!");
  return { valid: true };
}

export async function checkInviteCodeValidDetailed(code: string): Promise<InviteValidationResult> {
  const normalized = normalizeInviteCode(code);
  devLog("🔍 Normalized code:", normalized);

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  devLog("🔐 Service Role Key exists:", !!serviceRoleKey);
  devLog("🔐 Supabase URL:", supabaseUrl);

  if (!serviceRoleKey || !supabaseUrl) {
    logInvalid("missing_env", !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : "NEXT_PUBLIC_SUPABASE_URL");
    return {
      valid: false,
      reason: "missing_env",
      detail: !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : "NEXT_PUBLIC_SUPABASE_URL",
    };
  }

  if (!normalized) {
    logInvalid("empty");
    return { valid: false, reason: "empty" };
  }

  const supabase = getBetaInviteServiceClient();
  if (!supabase) {
    logInvalid("missing_env", "getBetaInviteServiceClient");
    return { valid: false, reason: "missing_env", detail: "service client" };
  }

  return checkInviteCodeValidWithClient(supabase, normalized);
}

/** @deprecated Prefer checkInviteCodeValidDetailed for debugging; boolean wrapper for callers. */
export async function checkInviteCodeValid(code: string): Promise<boolean> {
  const result = await checkInviteCodeValidDetailed(code);
  return result.valid;
}

export function getBetaInviteServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
