import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type PatchableKey = "username" | "bio" | "trader_style" | "avatar_url";
type Patch = Partial<Record<PatchableKey, string | null>>;

function isStringOrNull(x: unknown): x is string | null {
  return typeof x === "string" || x === null;
}

function normalizeString(v: string): string | null {
  const t = v.trim();
  return t.length ? t : null;
}

function pickPatch(body: unknown): Patch {
  if (!body || typeof body !== "object") return {};
  const obj = body as Record<string, unknown>;

  const keys: PatchableKey[] = ["username", "bio", "trader_style", "avatar_url"];
  const out: Patch = {};

  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const val = obj[k];
      if (isStringOrNull(val)) {
        out[k] = typeof val === "string" ? normalizeString(val) : null;
      }
    }
  }

  return out;
}

async function getAuthedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { supabase, user: null, authError: error.message };
  }

  return { supabase, user: data.user ?? null, authError: null };
}

export async function GET() {
  const { supabase, user, authError } = await getAuthedUser();

  if (!user) {
    return NextResponse.json(
      { error: authError ?? "Not authenticated" },
      { status: 401 }
    );
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

export async function PATCH(req: NextRequest) {
  const { supabase, user, authError } = await getAuthedUser();

  if (!user) {
    return NextResponse.json(
      { error: authError ?? "Not authenticated" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const patch = pickPatch(body);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { ok: true, changed: false },
      { status: 200 }
    );
  }

  const { data: existingProfile, error: existingError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json(
      { error: existingError.message },
      { status: 500 }
    );
  }

  if (existingProfile) {
    const updatePayload: {
      username?: string;
      bio?: string | null;
      trader_style?: string | null;
      avatar_url?: string | null;
    } = {};

    if (typeof patch.username === "string" && patch.username.trim().length > 0) {
      updatePayload.username = patch.username.trim();
    }

    if (patch.bio !== undefined) {
      updatePayload.bio = patch.bio;
    }

    if (patch.trader_style !== undefined) {
      updatePayload.trader_style = patch.trader_style;
    }

    if (patch.avatar_url !== undefined) {
      updatePayload.avatar_url = patch.avatar_url;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select("id, username, bio, trader_style, avatar_url")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message, code: (error as any).code ?? null },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, changed: true, profile: data },
      { status: 200 }
    );
  }

  if (typeof patch.username !== "string" || patch.username.trim().length === 0) {
    return NextResponse.json(
      { error: "username is required when creating a profile" },
      { status: 400 }
    );
  }

  const insertPayload: {
    id: string;
    username: string;
    bio?: string | null;
    trader_style?: string | null;
    avatar_url?: string | null;
  } = {
    id: user.id,
    username: patch.username.trim(),
  };

  if (patch.bio !== undefined) {
    insertPayload.bio = patch.bio;
  }

  if (patch.trader_style !== undefined) {
    insertPayload.trader_style = patch.trader_style;
  }

  if (patch.avatar_url !== undefined) {
    insertPayload.avatar_url = patch.avatar_url;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert(insertPayload)
    .select("id, username, bio, trader_style, avatar_url")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message, code: (error as any).code ?? null },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { ok: true, changed: true, profile: data },
    { status: 200 }
  );
}