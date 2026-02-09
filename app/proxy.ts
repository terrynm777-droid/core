// app/proxy.ts
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: Request) {
  return updateSession(request);
}