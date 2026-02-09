import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return NextResponse.json({ user: data?.user ?? null, error: error?.message ?? null });
}