import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WaitlistJson = {
  success: boolean;
  message: string;
};

type UTMFields = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseEmailFromBody(body: unknown): string | null {
  if (!isRecord(body) || typeof body.email !== "string") return null;
  const trimmed = body.email.trim();
  if (!trimmed || !EMAIL_RE.test(trimmed)) return null;
  return trimmed;
}

function parseOptionalText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseUTMFromBody(body: unknown): UTMFields {
  if (!isRecord(body)) {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
    };
  }

  return {
    utm_source: parseOptionalText(body.utm_source),
    utm_medium: parseOptionalText(body.utm_medium),
    utm_campaign: parseOptionalText(body.utm_campaign),
  };
}

export async function POST(request: Request): Promise<NextResponse<WaitlistJson>> {
  const supabase = await getSupabaseServerClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid email address." },
      { status: 400 },
    );
  }

  const email = parseEmailFromBody(body);
  if (!email) {
    return NextResponse.json(
      { success: false, message: "Invalid email address." },
      { status: 400 },
    );
  }

  const utm = parseUTMFromBody(body);

  const { error } = await supabase.from("waitlist").insert({
    email,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, message: "This email is already on the list." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Please try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "You're on the list! We'll be in touch soon. 🎉",
  });
}
