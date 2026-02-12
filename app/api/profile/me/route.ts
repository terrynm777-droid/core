import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function pickPatch(body: any) {
  // undefined = “not provided” → do not touch column
  // null = explicit clear
  const out: Record<string, any> = {};
  const keys = ["username", "bio", "trader_style", "avatar_url"] as const;

  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(body, k)) {
      out[k] = body[k]; // can be null or string
    }
  }
  return out;
}

export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, bio, trader_style, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: profile ?? null }, { status: 200 });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const patch = pickPatch(body);

  // if they send nothing, do nothing
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // trim strings, keep nulls
  for (const k of Object.keys(patch)) {
    const v = patch[k];
    if (typeof v === "string") patch[k] = v.trim() || null;
  }

  // UPSERT ensures row exists
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...patch }, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}