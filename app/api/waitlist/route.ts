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

  const { error } = await supabase.from("waitlist").insert({ email });

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
