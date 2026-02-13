import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return NextResponse.json({ profile: null }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, trader_style")
    .eq("id", auth.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data }, { status: 200 });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  const payload = {
    id: auth.user.id,
    username: body?.username ?? null,
    bio: body?.bio ?? null,
    trader_style: body?.trader_style ?? null,
    avatar_url: body?.avatar_url ?? null,
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: profile, error: readErr } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, trader_style")
    .eq("id", auth.user.id)
    .single();

  if (readErr) {
    return NextResponse.json({ error: readErr.message }, { status: 500 });
  }

  return NextResponse.json({ profile }, { status: 200 });
}
EOF