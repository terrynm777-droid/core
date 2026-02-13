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
      // Only allow string or null. Ignore everything else.
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
  if (error) return { supabase, user: null, authError: error.message };
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

  // if they send nothing usable, do nothing
  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { ok: true, changed: false },
      { status: 200 }
    );
  }

  // Upsert ensures row exists; return updated row for sanity
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...patch }, { onConflict: "id" })
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