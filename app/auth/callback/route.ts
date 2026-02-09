import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // default MUST be /feed
  const next = url.searchParams.get("next") || "/feed";

  if (!code) {
    return NextResponse.redirect(new URL(`/auth?error=missing_code&next=${encodeURIComponent(next)}`, url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`, url)
    );
  }

  // redirect to intended page
  return NextResponse.redirect(new URL(next, url));
}