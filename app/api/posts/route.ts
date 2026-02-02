import { NextResponse } from "next/server";
import { createPost, listPosts } from "@/lib/postsStore";

export async function GET() {
  return NextResponse.json({ posts: listPosts() });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      authorName?: string;
      content?: string;
      imageUrl?: string;
    };

    if (!body?.content || !body.content.trim()) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    const post = createPost({
      authorName: body.authorName,
      content: body.content,
      imageUrl: body.imageUrl,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
}