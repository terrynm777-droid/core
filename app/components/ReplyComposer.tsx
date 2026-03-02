"use client";

import { useState } from "react";
import { useAttachments } from "@/app/components/useAttachments";

type DbAttachment = { kind: "image" | "video"; url: string; name?: string };

export default function ReplyComposer({
  placeholder,
  onSubmit,
}: {
  placeholder?: string;
  onSubmit: (text: string, attachments?: DbAttachment[]) => void | Promise<void>;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const {
    attachments, // {id, kind, previewUrl?, url?, uploading?, error?}
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

    if (attachments.some((a: any) => a.uploading)) return;

    const trimmed = text.trim();

    const attSnapshot: DbAttachment[] = attachments
      .filter((a: any) => !!a.url)
      .map((a: any) => ({ kind: a.kind, url: String(a.url), name: a.name }));

    if (!trimmed && attSnapshot.length === 0) return;

    const snapshotText = trimmed;

    setSending(true);
    setText("");
    setAttachments([]);

    try {
      await onSubmit(snapshotText, attSnapshot);
    } catch {
      setText(snapshotText);
      // restore minimal attachments list (real urls only)
      setAttachments(
        attSnapshot.map((a) => ({
          id: `${Date.now()}-${Math.random()}`,
          kind: a.kind,
          url: a.url,
          name: a.name,
          uploading: false,
        }))
      );
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
        <div className="text-xs text-[#6B7A74]">
          {uploading ? "Uploading…" : attachments.length ? `${attachments.length} file(s) selected` : null}
        </div>
      </div>

      {attachments.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((a: any) => {
            const src = a.url ?? a.previewUrl ?? "";
            if (!src) return null;

            return (
              <div key={a.id} className="relative">
                {a.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={a.name || ""}
                    className="h-12 w-16 rounded-xl border border-[#D7E4DD] object-cover"
                  />
                ) : (
                  <video
                    src={src}
                    className="h-12 w-16 rounded-xl border border-[#D7E4DD] object-cover"
                    muted
                    playsInline
                    controls
                  />
                )}

                <button
                  type="button"
                  onClick={() => removeAttachment(a.id)}
                  disabled={sending || uploading}
                  className="absolute -right-2 -top-2 rounded-full border border-[#D7E4DD] bg-white px-2 text-xs disabled:opacity-50"
                >
                  ×
                </button>

                {a.uploading ? (
                  <div className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] text-[#6B7A74]">
                    …
                  </div>
                ) : a.error ? (
                  <div className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] text-red-600">
                    !
                  </div>
                ) : null}
              </div>
            );
          })}
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