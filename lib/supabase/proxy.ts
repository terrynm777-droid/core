// lib/supabase/proxy.ts
import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: Request) {
  const response = new Response(null, { status: 200 });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookie = request.headers.get("cookie") ?? "";
          // Next will parse these for you in the proxy runtime; supabase/ssr expects an array.
          // We'll rely on @supabase/ssr internal cookie parsing by passing the raw cookie header via fetch.
          // So return [] here; setAll handles writing.
          return [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const parts = [`${name}=${value}`];

            if (options?.maxAge) parts.push(`Max-Age=${options.maxAge}`);
            if (options?.expires) parts.push(`Expires=${new Date(options.expires).toUTCString()}`);
            if (options?.path) parts.push(`Path=${options.path}`);
            if (options?.domain) parts.push(`Domain=${options.domain}`);
            if (options?.sameSite) parts.push(`SameSite=${options.sameSite}`);
            if (options?.secure) parts.push("Secure");
            if (options?.httpOnly) parts.push("HttpOnly");

            response.headers.append("Set-Cookie", parts.join("; "));
          });
        },
      },
    }
  );

  // refresh token if needed
  await supabase.auth.getClaims();

  return response;
}