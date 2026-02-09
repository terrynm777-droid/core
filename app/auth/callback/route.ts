// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/feed";

  // If no code, just go where they intended (or feed)
  if (!code) {
    return NextResponse.redirect(new URL(next, url.origin));
  }

  const supabase = await createClient();

  // Exchange the code for a session cookie
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  // Even if exchange fails, don't send them to home. Send them to auth with next.
  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?next=${encodeURIComponent(next)}`, url.origin)
    );
  }

  // Success: go to intended page
  return NextResponse.redirect(new URL(next, url.origin));
}