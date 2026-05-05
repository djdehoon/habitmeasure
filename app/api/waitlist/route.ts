import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WaitlistJson = {
  success: boolean;
  message: string;
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

export async function POST(request: Request): Promise<NextResponse<WaitlistJson>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Ongeldig e-mailadres." },
      { status: 400 },
    );
  }

  const email = parseEmailFromBody(body);
  if (!email) {
    return NextResponse.json(
      { success: false, message: "Ongeldig e-mailadres." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("waitlist").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, message: "Dit e-mailadres staat al op de lijst." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Probeer het later opnieuw." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Je staat op de lijst! 🎉",
  });
}
