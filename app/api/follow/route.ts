import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "";

  // Stub: implement later with a `follows` table.
  // For now just return OK so UI works.
  return NextResponse.json({ ok: true, username }, { status: 200 });
}