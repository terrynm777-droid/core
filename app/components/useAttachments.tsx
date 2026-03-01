// app/components/useAttachments.tsx
"use client";

import React, { useCallback, useRef, useState } from "react";

export type Att = {
  kind: "image" | "video";
  url: string;          // final public URL (from Supabase)
  name?: string;
  previewUrl?: string;  // local blob preview for instant UI
};

type UploadRes = { url?: string; error?: string };

async function uploadOne(file: File): Promise<UploadRes> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/uploads", { method: "POST", body: fd });
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

  const removeAttachment = useCallback((urlOrPreview: string) => {
    setAttachments((prev) =>
      prev.filter((a) => a.url !== urlOrPreview && a.previewUrl !== urlOrPreview)
    );
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;

    setUploading(true);
    try {
      // add previews immediately
      const staged = files.map((f) => ({
        kind: kindFromFile(f),
        url: "",
        name: f.name,
        previewUrl: URL.createObjectURL(f),
      }));

      setAttachments((prev) => [...prev, ...staged]);

      // upload sequentially (simple + predictable)
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const out = await uploadOne(f);

        if (!out.url) {
          // remove failed one
          const preview = staged[i].previewUrl!;
          setAttachments((prev) => prev.filter((a) => a.previewUrl !== preview));
          continue;
        }

        const preview = staged[i].previewUrl!;
        setAttachments((prev) =>
          prev.map((a) =>
            a.previewUrl === preview ? { ...a, url: out.url! } : a
          )
        );
      }
    } finally {
      setUploading(false);
    }
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
    onPickFiles,
    removeAttachment,
    setAttachments,
    onDrop,
    onDragOver,
    AttachmentButton,
    AttachmentInput,
  };
}