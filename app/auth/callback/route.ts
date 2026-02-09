import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(next: string | null) {
  if (!next) return "/feed";
  if (!next.startsWith("/")) return "/feed";
  // prevent open redirects
  if (next.startsWith("//")) return "/feed";
  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNext(requestUrl.searchParams.get("next"));

  // If no code, just go to login (or feed if already logged in)
  if (!code) {
    return NextResponse.redirect(new URL(`/auth?next=${encodeURIComponent(next)}`, requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}