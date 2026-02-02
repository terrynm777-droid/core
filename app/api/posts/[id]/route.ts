import { NextResponse } from "next/server";
import { getPost } from "@/lib/postsStore";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const post = getPost(params.id);
  if (!post) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}