// app/components/ReplyComposer.tsx
"use client";

import { useState } from "react";
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
  const [sending, setSending] = useState(false);

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
    if (sending || uploading) return;

    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;

    const snapshotText = trimmed;
    const snapshotAtt = [...attachments]; // ✅ copy

    setSending(true);
    setText("");
    setAttachments([]);

    try {
      await onSubmit(snapshotText, snapshotAtt);
    } catch {
      setText(snapshotText);
      setAttachments(snapshotAtt);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#D7E4DD] bg-white p-3" onDrop={onDrop} onDragOver={onDragOver}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder || "Write…"}
        className="min-h-[72px] w-full resize-none rounded-2xl border border-[#D7E4DD] bg-white p-3 text-sm outline-none"
      />

      <div className="mt-2 flex items-center gap-2">
        <AttachmentButton />
        <AttachmentInput />
        <div className="text-xs text-[#6B7A74]">{uploading ? "Uploading…" : null}</div>
      </div>

      {attachments.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((a) => (
            <div key={a.url} className="relative">
              {a.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.url} alt={a.name || ""} className="h-12 w-16 rounded-xl border border-[#D7E4DD] object-cover" />
              ) : (
                <div className="flex h-12 w-16 items-center justify-center rounded-xl border border-[#D7E4DD] bg-white text-[10px] text-[#6B7A74]">
                  Video
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(a.url)}
                disabled={sending || uploading}
                className="absolute -right-2 -top-2 rounded-full border border-[#D7E4DD] bg-white px-2 text-xs disabled:opacity-50"
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
          disabled={sending || uploading || (!text.trim() && attachments.length === 0)}
          className="rounded-xl bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {sending ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}