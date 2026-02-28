"use client";

import { useRef, useState } from "react";

export type Att = { kind: "image" | "video"; url: string };

export function useAttachments() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<Att[]>([]);
  const [uploading, setUploading] = useState(false);

  function kindOf(file: File): Att["kind"] {
    return file.type.startsWith("video/") ? "video" : "image";
  }

  // TEMP uploader: local preview URL only (no storage persistence)
  async function uploadFile(file: File): Promise<string> {
    return URL.createObjectURL(file);
  }

  async function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setUploading(true);
    try {
      for (const f of files) {
        const url = await uploadFile(f);
        if (!url) continue;
        setAttachments((prev) => [...prev, { kind: kindOf(f), url }]);
      }
    } finally {
      setUploading(false);
    }
  }

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
    onPickFiles,
    removeAttachment,
    setAttachments,
    AttachmentButton,
    AttachmentInput,
  };
}