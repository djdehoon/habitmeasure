"use server";

import { redeemInviteForUserWithServiceClient } from "@/lib/beta/redeemInviteCore";
import {
  checkInviteCodeValidWithClient,
  getBetaInviteServiceClient,
  normalizeInviteCode,
} from "@/lib/beta/verifyInvite";

export async function redeemInviteCode(
  userId: string,
  inviteCode: string,
): Promise<{ ok: boolean; error?: string }> {
  const normalized = normalizeInviteCode(inviteCode);

  if (!normalized) {
    return { ok: false, error: "Invalid invite code format." };
  }

  const service = getBetaInviteServiceClient();
  if (!service) {
    return { ok: false, error: "Beta invites are temporarily unavailable (server configuration)." };
  }

  const validation = await checkInviteCodeValidWithClient(service, normalized);
  if (!validation.valid) {
    const hint =
      validation.reason === "missing_env"
        ? "Server configuration error."
        : validation.reason === "exhausted"
          ? "This invite has no remaining uses."
          : "Invalid or expired invite.";
    return { ok: false, error: hint };
  }

  try {
    const result = await redeemInviteForUserWithServiceClient(service, userId, normalized);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true };
  } catch (err) {
    console.error("redeemInviteCode:", err);
    return {
      ok: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
