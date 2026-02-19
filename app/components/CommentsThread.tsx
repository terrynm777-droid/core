"use client";

import { useEffect, useState } from "react";
import ReplyComposer from "@/app/components/ReplyComposer";

type Author = { username: string | null; avatar_url: string | null } | null;

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  parent_comment_id: string | null;
  author?: Author;
};

function AuthorLine({ author }: { author?: Author }) {
  const u = author?.username ?? "unknown";
  return <span className="font-medium">@{u}</span>;
}

/**
 * IMPORTANT:
 * - This component does NOT render a "Comment" button.
 * - Your FIRST comment button should live in PostActions (the one next to Like).
 * - When user clicks that first button, you should render this CommentsThread (or pass `open=true`).
 */
export default function CommentsThread({
  postId,
  open = true,
}: {
  postId: string;
  open?: boolean;
}) {
  const [showComposer, setShowComposer] = useState(open);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);

  async function loadComments() {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(
        `/api/posts/${encodeURIComponent(postId)}/comments?limit=50&offset=0`,
        { cache: "no-store", credentials: "include" }
      );

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      setComments(Array.isArray(json?.comments) ? json.comments : []);
      setLoadedOnce(true);
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  async function submitTopLevel(text: string) {
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
        credentials: "include",
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorMsg(json?.error || `HTTP ${res.status}`);
        return;
      }

      const created = json?.comment as Comment | undefined;

      if (created?.id) setComments((prev) => [...prev, created]);
      else await loadComments();

      setShowComments(true);
      setLoadedOnce(true);
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    }
  }

  // preload once when composer opens (so view comments is instant)
  useEffect(() => {
    if (showComposer && !loadedOnce) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComposer]);

  if (!showComposer) return null;

  return (
    <div className="mt-2 rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-3">
      <ReplyComposer placeholder="Write a comment…" onSubmit={submitTopLevel} />

      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            const next = !showComments;
            setShowComments(next);
            if (next) loadComments();
          }}
          className="text-sm text-[#4B5B55] hover:underline"
        >
          {showComments ? "Hide comments" : "View comments"}
        </button>

        <div className="text-xs text-[#6B7A74]">{comments.length ? `${comments.length} comment(s)` : ""}</div>
      </div>

      {errorMsg ? <div className="mt-2 text-xs text-red-600">{errorMsg}</div> : null}

      {showComments ? (
        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-xs text-[#6B7A74]">Loading…</div>
          ) : comments.length === 0 ? (
            <div className="text-xs text-[#6B7A74]">No comments yet.</div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="rounded-2xl border border-[#D7E4DD] bg-white p-3">
                <div className="flex items-center justify-between text-xs text-[#6B7A74]">
                  <AuthorLine author={c.author} />
                  <span>{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm">{c.body}</div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}