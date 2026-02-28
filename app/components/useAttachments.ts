"use client";

import { useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Att = { kind: "image" | "video"; url: string };

function getPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

function extFromName(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "bin";
}

export function useAttachments() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<Att[]>([]);
  const [uploading, setUploading] = useState(false);

  async function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-pick same file
    if (!files.length) return;

    setUploading(true);
    try {
      const sb = getPublicSupabase();

      for (const f of files) {
        const kind: Att["kind"] = f.type.startsWith("video/") ? "video" : "image";
        const path = `c/${crypto.randomUUID()}.${extFromName(f.name)}`;

        const { error: upErr } = await sb.storage.from("uploads").upload(path, f, {
          upsert: false,
          contentType: f.type,
        });
        if (upErr) continue;

        const { data } = sb.storage.from("uploads").getPublicUrl(path);
        const url = data.publicUrl;

        setAttachments((prev) => [...prev, { kind, url }]);
      }
    } finally {
      setUploading(false);
    }
  }

  function removeAttachment(url: string) {
    setAttachments((prev) => prev.filter((x) => x.url !== url));
  }

  return { fileRef, attachments, uploading, onPickFiles, removeAttachment, setAttachments };
}