"use client";

import { useEffect, useState } from "react";
import CommentsThread from "@/app/components/CommentsThread";

function IconLike({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3v11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 11l3.2-6.4A2.2 2.2 0 0 1 12.2 3H13a2 2 0 0 1 2 2v2.5a2 2 0 0 1-2 2h6.2a2 2 0 0 1 2 2.4l-1 6A2.5 2.5 0 0 1 17.7 22H7"
        stroke="currentColor"
        strokeWidth="1.8"
        fill={filled ? "currentColor" : "none"}
        opacity={filled ? 0.18 : 1}
      />
    </svg>
  );
}

function IconComment() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function PostActions({ postId }: { postId: string }) {
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showComments, setShowComments] = useState(false);

  async function loadLike() {
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (!res.ok) return;
    setLiked(!!json?.liked);
    setLikeCount(Number(json?.likeCount ?? 0));
  }

  useEffect(() => {
    loadLike();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function toggleLike() {
    if (busy) return;
    setBusy(true);

    // optimistic
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));

    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to like");
      await loadLike();
    } catch {
      // rollback if failed
      setLiked((v) => !v);
      setLikeCount((c) => c + (liked ? 1 : -1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      {/* LinkedIn-style action row */}
      <div className="flex items-center justify-between border-t border-[#E6EFEA] pt-2">
        <button
          type="button"
          onClick={toggleLike}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-[#2B3A34] hover:bg-[#F3F7F5] disabled:opacity-50"
        >
          <IconLike filled={liked} />
          <span>{liked ? "Liked" : "Like"}</span>
          <span className="text-xs text-[#6B7A74]">{likeCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-[#2B3A34] hover:bg-[#F3F7F5]"
        >
          <IconComment />
          <span>Comment</span>
        </button>
      </div>

      {showComments ? <CommentsThread postId={postId} /> : null}
    </div>
  );
}