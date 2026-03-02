"use client";

import React, { useCallback, useRef, useState } from "react";

export type Att = {
  id: string;
  kind: "image" | "video";
  name?: string;

  // local preview (blob) so UI shows immediately
  previewUrl?: string;

  // real public URL after /api/uploads returns
  url?: string;

  uploading?: boolean;
  error?: string;
};

type UploadRes = { url?: string; error?: string };

async function uploadOne(file: File): Promise<UploadRes> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/uploads", {
    method: "POST",
    body: fd,
    credentials: "include",
  });

  const json = (await res.json().catch(() => null)) as any;
  if (!res.ok) return { error: json?.error || `HTTP ${res.status}` };
  return { url: json?.url };
}

function kindFromFile(file: File): "image" | "video" {
  return file.type?.startsWith("video/") ? "video" : "image";
}

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function useAttachments() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<Att[]>([]);
  const [uploading, setUploading] = useState(false);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const hit = prev.find((a) => a.id === id);
      if (hit?.previewUrl) URL.revokeObjectURL(hit.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments((prev) => {
      prev.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      });
      return [];
    });
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;

    // 1) add previews immediately
    const items: Att[] = files.map((f) => ({
      id: uid(),
      kind: kindFromFile(f),
      name: f.name,
      previewUrl: URL.createObjectURL(f),
      uploading: true,
    }));

    setAttachments((prev) => [...prev, ...items]);
    setUploading(true);

    // 2) upload sequentially (predictable)
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const id = items[i].id;

      const out = await uploadOne(f);

      setAttachments((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;

          if (!out.url) {
            return {
              ...a,
              uploading: false,
              error: out.error || "upload failed",
            };
          }

          return {
            ...a,
            url: out.url,
            uploading: false,
            error: undefined,
          };
        })
      );
    }

    // 3) update global uploading based on current state
    setAttachments((prev) => {
      const anyUploading = prev.some((a) => a.uploading);
      setUploading(anyUploading);
      return prev;
    });
  }, []);

  const onPickFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = "";
      await addFiles(files);
    },
    [addFiles]
  );

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer?.files ?? []);
      await addFiles(files);
    },
    [addFiles]
  );

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
    setAttachments, // legacy: prefer clearAttachments/removeAttachment
    clearAttachments,
    removeAttachment,
    onPickFiles,
    onDrop,
    onDragOver,
    AttachmentButton,
    AttachmentInput,
  };
}