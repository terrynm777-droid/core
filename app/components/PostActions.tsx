"use client";

import { useEffect, useState } from "react";
import CommentsThread from "@/app/components/CommentsThread";

export default function PostActions({ postId }: { postId: string }) {
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  async function loadLike() {
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (!res.ok) return;
    setLiked(!!json?.liked);
    setLikeCount(Number(json?.likeCount ?? 0));
  }

  async function toggleLike() {
    if (busy) return;
    setBusy(true);

    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));

    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to like");
      await loadLike();
    } catch {
      setLiked((v) => !v);
      setLikeCount((c) => c + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadLike();
  }, [postId]);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleLike}
          disabled={busy}
          className="rounded-xl border border-[#D7E4DD] bg-white px-3 py-1.5 text-sm hover:shadow-sm disabled:opacity-50"
        >
          {liked ? "Liked" : "Like"} · {likeCount}
        </button>
      </div>

      <CommentsThread postId={postId} />
    </div>
  );
}