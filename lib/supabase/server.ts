import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies(); // <-- fix: cookies() can be async
  const store = cookieStore as any;    // <-- fix: TS readonly cookie type

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll?.() ?? [];
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              store.set?.(name, value, options);
            });
          } catch {
            // ignore if cookies are read-only in this context
          }
        },
      },
    }
  );
}