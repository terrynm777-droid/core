"use client";

import { useRef, useState } from "react";

type Attachment = { kind: "image" | "video"; url: string };

export default function ReplyComposer({
  placeholder,
  onSubmit,
}: {
  placeholder?: string;
  onSubmit: (text: string, attachments?: Attachment[]) => void | Promise<void>;
}) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function kindOf(file: File): Attachment["kind"] {
    return file.type.startsWith("video/") ? "video" : "image";
  }

  // NOTE: this is a placeholder uploader.
  // If you already have Supabase Storage set up for uploads, replace uploadFileToPublicUrl() with your existing logic.
  async function uploadFileToPublicUrl(file: File): Promise<string> {
    // If you don’t have uploads yet, this prevents breaking builds.
    // You MUST implement real upload (Supabase Storage) to actually attach files.
    return "";
  }

  async function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setUploading(true);
    try {
      for (const f of files) {
        const url = await uploadFileToPublicUrl(f);
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

  async function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    await onSubmit(trimmed, attachments);
    setText("");
    setAttachments([]);
  }

  return (
    <div className="rounded-2xl border border-[#D7E4DD] bg-white p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder || "Write…"}
        className="min-h-[72px] w-full resize-none rounded-2xl border border-[#D7E4DD] bg-white p-3 text-sm outline-none"
      />

      {attachments.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((a) => (
            <div key={a.url} className="relative">
              {a.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.url}
                  alt=""
                  className="h-12 w-16 rounded-xl border border-[#D7E4DD] object-cover"
                />
              ) : (
                <div className="h-12 w-16 rounded-xl border border-[#D7E4DD] bg-white flex items-center justify-center text-[10px] text-[#6B7A74]">
                  Video
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(a.url)}
                className="absolute -right-2 -top-2 rounded-full border border-[#D7E4DD] bg-white px-2 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-[#6B7A74]">
          {uploading ? "Uploading…" : `${text.length}/20000`}
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ + button */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm font-medium hover:shadow-sm"
          >
            +
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={onPickFiles}
          />

          <button
            type="button"
            onClick={submit}
            disabled={!text.trim() || uploading}
            className="rounded-xl bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}