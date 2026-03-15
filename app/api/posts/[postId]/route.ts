import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function resolveParams<T extends object>(p: any): Promise<T> {
  if (p && typeof p.then === "function") return (await p) as T;
  return (p ?? {}) as T;
}

export async function GET(req: NextRequest, context: any) {
  try {
    // support both older routes using {id} and current folder using {postId}
    const params = await resolveParams<{ postId?: string; id?: string }>(context?.params);
    const postId = (params.postId ?? params.id ?? "").trim();

    if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

    const supabase = await createClient() as any;

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ post: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}