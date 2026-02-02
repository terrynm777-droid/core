"use client";

import { useMemo, useState } from "react";

export default function PostComposer({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  const [authorName, setAuthorName] = useState("Terry");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPost = useMemo(() => content.trim().length > 0 && !busy, [content, busy]);

  async function submit() {
    setError(null);
    if (!content.trim()) {
      setError("Write something first.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName,
          content,
          imageUrl: imageUrl.trim() ? imageUrl.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to post");
        return;
      }

      setContent("");
      setImageUrl("");
      onCreated(data.post.id as string);
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
      <div className="text-lg font-semibold">Create a post</div>
      <div className="mt-1 text-sm text-[#6B7A74]">
        MVP: text + optional image URL. Auth later.
      </div>

      <div className="mt-5 grid gap-3">
        <label className="grid gap-1">
          <span className="text-xs font-medium text-[#3E4C47]">Author</span>
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="rounded-2xl border border-[#D7E4DD] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#BFE8CF]"
            placeholder="Name"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-[#3E4C47]">Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[140px] rounded-2xl border border-[#D7E4DD] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#BFE8CF]"
            placeholder="What happened? What’s signal?"
          />
          <span className="text-[11px] text-[#6B7A74]">
            {content.trim().length}/2000
          </span>
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-[#3E4C47]">
            Image URL (optional)
          </span>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="rounded-2xl border border-[#D7E4DD] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#BFE8CF]"
            placeholder="https://..."
          />
        </label>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          onClick={submit}
          disabled={!canPost}
          className="mt-2 inline-flex items-center justify-center rounded-2xl bg-[#22C55E] px-6 py-3 font-medium text-white shadow-sm disabled:opacity-50"
        >
          {busy ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}