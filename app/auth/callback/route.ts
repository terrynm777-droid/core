import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

function safeNext(raw: string | null) {
  if (!raw) return "/feed";
  try {
    const decoded = decodeURIComponent(raw);
    if (!decoded.startsWith("/")) return "/feed";
    if (decoded === "/") return "/feed";
    return decoded;
  } catch {
    return "/feed";
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  // Always redirect to next (default /feed)
  const redirectUrl = new URL(next, url.origin);
  const res = NextResponse.redirect(redirectUrl);

  // IMPORTANT: use createServerClient and attach cookie setters to the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // If no code, send them back to auth with the same next
  if (!code) {
    return NextResponse.redirect(
      new URL(`/auth?next=${encodeURIComponent(next)}`, url.origin)
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?next=${encodeURIComponent(next)}`, url.origin)
    );
  }

  return res;
}