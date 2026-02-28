"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAttachments } from "@/app/components/useAttachments";

const MAX_CHARS = 20000;

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const { attachments, AttachmentButton, AttachmentInput } =
    useAttachments();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const trimmed = useMemo(() => content.trim(), [content]);
  const count = trimmed.length;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!trimmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          feed: "en",
          attachments,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error);

      router.push("/feed");
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7FAF8] px-6 py-10">
      <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[160px] rounded-2xl border border-[#D7E4DD] bg-white p-4"
        />

        <div className="mt-2 flex items-center gap-2">
          <AttachmentButton />
          <AttachmentInput />
        </div>

        <button className="rounded-2xl bg-[#22C55E] px-5 py-2.5 text-white">
          {loading ? "Posting…" : "Post"}
        </button>

        {err && <div className="text-red-600 text-sm">{err}</div>}
      </form>
    </main>
  );
}