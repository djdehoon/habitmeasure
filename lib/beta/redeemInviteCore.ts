import { devLog } from "@/lib/utils/logger";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Redeem a normalized invite for a user using a service-role Supabase client.
 * Same rules as POST /api/beta/redeem.
 */
export async function redeemInviteForUserWithServiceClient(
  service: SupabaseClient,
  userId: string,
  normalizedCode: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // ... alle checks daarvoor ...

  devLog("🚀 redeemInviteForUserWithServiceClient called with:", { userId, normalizedCode });

  const { data: invite, error: inviteErr } = await service
    .from("beta_testers")
    .select("id, use_count, max_uses")
    .eq("invite_code", normalizedCode)
    .maybeSingle();

  devLog("redeemInviteCore - Invite lookup:", {
    normalizedCode,
    invite,
    inviteErr,
  });

  if (inviteErr || !invite) {
    return { ok: false, error: "Invalid or expired invite." };
  }

  // ✅ VOEG HIER DE LOGS IN
  devLog("Before update query:", {
    id: invite.id,
    use_count: invite.use_count,
    max_uses: invite.max_uses,
    query_will_check: `use_count == ${invite.use_count} AND use_count < ${invite.max_uses}`
  });

  const { data: bumped, error: bumpErr } = await service
    .from("beta_testers")
    .update({ use_count: invite.use_count + 1 })
    .eq("id", invite.id)
    .eq("use_count", invite.use_count)
    .lt("use_count", invite.max_uses)
    .select("id")
    .maybeSingle();

  devLog("Update result:", { bumped, bumpErr });

  if (bumpErr || !bumped) {
    return { ok: false, error: "Invite could not be redeemed." };
  }

  const { error: flagErr } = await service
    .from("user_profiles")
    .update({ is_beta_tester: true })
    .eq("user_id", userId);

  if (flagErr) {
    await service.from("beta_testers").update({ use_count: invite.use_count }).eq("id", invite.id);
    return { ok: false, error: "Could not activate beta access." };
  }

  return { ok: true };
}


