// app/api/uploads/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UploadResp =
  | { url: string; path: string }
  | { error: string };

function kindFromMime(mime: string): "image" | "video" {
  return mime.startsWith("video/") ? "video" : "image";
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json<UploadResp>({ error: "Not authenticated" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json<UploadResp>({ error: "file is required" }, { status: 400 });
  }

  const maxBytes = 25 * 1024 * 1024; // 25MB
  if (file.size > maxBytes) {
    return NextResponse.json<UploadResp>({ error: "max 25MB" }, { status: 400 });
  }

  const bucket = "attachments";
  const safeName = (file.name || "upload").replace(/[^\w.\-]+/g, "_");
  const ext = safeName.includes(".") ? safeName.split(".").pop() : "";
  const uuid = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const path = `${user.id}/${uuid}${ext ? `.${ext}` : ""}`;

  const bytes = await file.arrayBuffer();

  const { error: upErr } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type || (kindFromMime(file.type) === "video" ? "video/mp4" : "image/jpeg"),
    upsert: false,
  });

  if (upErr) {
    return NextResponse.json<UploadResp>({ error: upErr.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  const url = data.publicUrl;

  return NextResponse.json<UploadResp>({ url, path }, { status: 200 });
}