"use client";

import { useAttachments } from "@/app/components/useAttachments";

type Attachment = { kind: "image" | "video"; url: string; name?: string };

export default function ReplyComposer({
  placeholder,
  onSubmit,
}: {
  placeholder?: string;
  onSubmit: (text: string, attachments?: Attachment[]) => void | Promise<void>;
}) {
  const [text, setText] = useState("");
  const {
    attachments,
    uploading,
    setAttachments,
    removeAttachment,
    AttachmentButton,
    AttachmentInput,
    onDrop,
    onDragOver,
  } = useAttachments();

  async function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    await onSubmit(trimmed, attachments);
    setText("");
    setAttachments([]);
  }

  return (
    <div
      className="rounded-2xl border border-[#D7E4DD] bg-white p-3"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder || "Write…"}
        className="min-h-[72px] w-full resize-none rounded-2xl border border-[#D7E4DD] bg-white p-3 text-sm outline-none"
      />

      {/* ✅ picker row */}
      <div className="mt-2 flex items-center gap-2">
        <AttachmentButton />
        <AttachmentInput />
        <div className="text-xs text-[#6B7A74]">
          {uploading ? "Uploading…" : null}
        </div>
      </div>

      {/* ✅ preview INSIDE bubble */}
      {attachments.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((a) => (
            <div key={a.url} className="relative">
              {a.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.url}
                  alt={a.name || ""}
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
        <div className="text-xs text-[#6B7A74]">{`${text.length}/20000`}</div>
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
  );
}

import { useState } from "react";