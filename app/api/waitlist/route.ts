import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type WaitlistPayload = {
  email?: string;
  name?: string;
  source?: string; // optional (e.g., "landing", "vercel", etc.)
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as WaitlistPayload;

    const emailRaw = (body.email ?? "").trim().toLowerCase();
    const nameRaw = (body.name ?? "").trim();
    const sourceRaw = (body.source ?? "website").trim();

    if (!emailRaw || !isValidEmail(emailRaw)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { ok: false, error: "Server misconfigured (missing Supabase env)." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // NOTE: This assumes you have a table named `waitlist`
    // with columns like:
    // - email (text, unique recommended)
    // - name (text, nullable)
    // - source (text, nullable)
    // - created_at (timestamp, default now())
    //
    // If your table columns differ, tell me the exact column names.

    const { error } = await supabase.from("waitlist").insert([
      {
        email: emailRaw,
        name: nameRaw || null,
        source: sourceRaw || null
      }
    ]);

    // If email is unique, Supabase/Postgres might throw duplicate errors
    if (error) {
      // Postgres unique violation code: 23505
      const msg = String(error.message || "");
      if (msg.includes("duplicate") || msg.includes("23505")) {
        return NextResponse.json({ ok: true, alreadyJoined: true });
      }

      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Bad request." },
      { status: 400 }
    );
  }
}