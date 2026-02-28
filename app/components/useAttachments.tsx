// app/components/useAttachments.tsx
"use client";

import React, { useCallback, useRef, useState } from "react";

export type Att = { kind: "image" | "video"; url: string; name?: string };

type UploadRes = { url?: string; error?: string };

async function uploadOne(file: File): Promise<UploadRes> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/uploads", {
    method: "POST",
    body: fd,
  });

  const json = (await res.json().catch(() => null)) as any;
  if (!res.ok) return { error: json?.error || `HTTP ${res.status}` };
  return { url: json?.url };
}

function kindFromFile(file: File): "image" | "video" {
  return file.type?.startsWith("video/") ? "video" : "image";
}

export function useAttachments() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<Att[]>([]);
  const [uploading, setUploading] = useState(false);

  const removeAttachment = useCallback((url: string) => {
    setAttachments((prev) => prev.filter((a) => a.url !== url));
  }, []);

  const onPickFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    setUploading(true);
    try {
      const next: Att[] = [];
      for (const f of files) {
        const out = await uploadOne(f);
        if (!out.url) continue;
        next.push({ kind: kindFromFile(f), url: out.url, name: f.name });
      }
      if (next.length) setAttachments((prev) => [...prev, ...next]);
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files ?? []);
    if (!files.length) return;

    setUploading(true);
    try {
      const next: Att[] = [];
      for (const f of files) {
        const out = await uploadOne(f);
        if (!out.url) continue;
        next.push({ kind: kindFromFile(f), url: out.url, name: f.name });
      }
      if (next.length) setAttachments((prev) => [...prev, ...next]);
    } finally {
      setUploading(false);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const AttachmentInput = useCallback(() => {
    return (
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={onPickFiles}
      />
    );
  }, [onPickFiles]);

  const AttachmentButton = useCallback(() => {
    return (
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="h-9 w-9 rounded-xl border border-[#D7E4DD] bg-white text-sm hover:shadow-sm"
        aria-label="Add attachment"
        disabled={uploading}
      >
        +
      </button>
    );
  }, [uploading]);

  return {
    fileRef,
    attachments,
    uploading,
    onPickFiles,
    removeAttachment,
    setAttachments,
    onDrop,
    onDragOver,
    AttachmentButton,
    AttachmentInput,
  };
}