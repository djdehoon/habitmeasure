import { NextResponse } from "next/server";
import { checkInviteCodeValid, getBetaInviteServiceClient, normalizeInviteCode } from "@/lib/beta/verifyInvite";

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const code = normalizeInviteCode(sp.get("invite") ?? sp.get("code"));
  if (!code) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  if (!getBetaInviteServiceClient()) {
    return NextResponse.json({ valid: false }, { status: 503 });
  }

  const valid = await checkInviteCodeValid(code);
  return NextResponse.json({ valid });
}
