import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  // If no code, go back to auth
  if (!code) {
    return NextResponse.redirect(
      new URL(`/auth?next=${encodeURIComponent(next)}`, url.origin)
    );
  }

  // IMPORTANT: create response first so we can attach Set-Cookie to it
  const response = NextResponse.redirect(new URL(next, url.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?next=${encodeURIComponent(next)}`, url.origin)
    );
  }

  return response;
}