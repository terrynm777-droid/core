// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deletePostById, getPostById } from "@/lib/posts";

export const runtime = "nodejs";

// Next 16 route types: params is a Promise
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const post = getPostById(id);

  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const ok = deletePostById(id);

  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}