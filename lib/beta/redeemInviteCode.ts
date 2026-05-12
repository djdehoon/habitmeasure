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

  const isValid = await checkInviteCodeValidWithClient(service, normalized);
  if (!isValid) {
    return { ok: false, error: "Invalid or expired invite." };
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
