import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizeEmail(raw: unknown) {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 3 || email.length > 254) return null;
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return ok ? email : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail((body as any).email);

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = req.headers.get("user-agent") ?? null;
    const referrer = req.headers.get("referer") ?? null;

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("waitlist").upsert(
      {
        email,
        ip,
        user_agent: userAgent,
        referrer,
      },
      { onConflict: "email" }
    );

    if (error) {
      console.error("supabase error", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("waitlist POST error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}