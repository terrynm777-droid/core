"use client";

import { useMemo, useState } from "react";
import { useAttachments } from "@/app/components/useAttachments";

export default function PostComposer({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  const [content, setContent] = useState("");
  const { attachments, AttachmentButton, AttachmentInput } =
    useAttachments();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPost = useMemo(
    () => content.trim().length > 0 && !busy,
    [content, busy]
  );

  async function submit() {
    setError(null);
    if (!content.trim()) return;

    setBusy(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          feed: "en",
          attachments,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error);
        return;
      }

      setContent("");
      onCreated(data.post.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[#D7E4DD] bg-white p-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[140px] w-full rounded-2xl border border-[#D7E4DD] p-3"
      />

      <div className="mt-2 flex items-center gap-2">
        <AttachmentButton />
        <AttachmentInput />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <button
        onClick={submit}
        disabled={!canPost}
        className="mt-3 rounded-2xl bg-[#22C55E] px-6 py-3 text-white"
      >
        {busy ? "Posting…" : "Post"}
      </button>
    </div>
  );
}