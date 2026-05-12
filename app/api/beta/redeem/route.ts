import { NextResponse } from "next/server";
import { redeemInviteForUserWithServiceClient } from "@/lib/beta/redeemInviteCore";
import { checkInviteCodeValid, getBetaInviteServiceClient, normalizeInviteCode } from "@/lib/beta/verifyInvite";
import { getServerUser } from "@/lib/supabase/server";

type Body = { code?: string };

export async function POST(request: Request) {
  const { user } = await getServerUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const code = normalizeInviteCode(body.code);
  if (!code) {
    return NextResponse.json({ ok: false, error: "Missing code." }, { status: 400 });
  }

  const service = getBetaInviteServiceClient();
  if (!service) {
    return NextResponse.json({ ok: false, error: "Server misconfigured." }, { status: 503 });
  }

  const { data: profile } = await service
    .from("user_profiles")
    .select("is_beta_tester")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.is_beta_tester === true) {
    return NextResponse.json({ ok: true, already: true });
  }

  const valid = await checkInviteCodeValid(code);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid or expired invite." }, { status: 400 });
  }

  const result = await redeemInviteForUserWithServiceClient(service, user.id, code);

  if (!result.ok) {
    const status =
      result.error === "No profile for this account." || result.error === "Invalid or expired invite."
        ? 400
        : result.error === "Invite could not be redeemed."
          ? 409
          : 500;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
