"use client";

import { useCallback, useRef, useState } from "react";

export type Attachment = {
  kind: "image" | "video";
  url: string;          // preview URL (object URL for now)
  name?: string;
};

function kindOf(file: File): Attachment["kind"] {
  return file.type.startsWith("video/") ? "video" : "image";
}

export function useAttachments() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  // TEMP preview-only. Replace with Supabase Storage later and return public URL.
  async function uploadFile(file: File): Promise<string> {
    return URL.createObjectURL(file);
  }

  const addFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) {
        const url = await uploadFile(f);
        if (!url) continue;
        setAttachments((prev) => [
          ...prev,
          { kind: kindOf(f), url, name: f.name },
        ]);
      }
    } finally {
      setUploading(false);
    }
  }, []);

  const onPickFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      e.target.value = "";
      await addFiles(files);
    },
    [addFiles]
  );

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = Array.from(e.dataTransfer.files || []);
      await addFiles(files);
    },
    [addFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  function removeAttachment(url: string) {
    setAttachments((prev) => prev.filter((x) => x.url !== url));
  }

  function AttachmentButton() {
    return (
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm font-medium hover:shadow-sm"
      >
        +
      </button>
    );
  }

  function AttachmentInput() {
    return (
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={onPickFiles}
      />
    );
  }

  return {
    fileRef,
    attachments,
    uploading,
    setAttachments,
    removeAttachment,
    onPickFiles,
    onDrop,
    onDragOver,
    AttachmentButton,
    AttachmentInput,
  };
} 