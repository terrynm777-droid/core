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

export default function CommentsThread({ postId }: { postId: string }) {
  const [showComposer, setShowComposer] = useState(false);
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

    const created = json?.comment;
    if (created?.id) setComments((prev) => [...prev, created]);
    else await loadComments();

    setShowComments(true);
    setLoadedOnce(true);
  }

  // optional: pre-load once when composer opens (so "View comments" is instant)
  useEffect(() => {
    if (showComposer && !loadedOnce) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComposer]);

  return (
    <div className="mt-3 border-t border-[#E6EEE9] pt-2">
      {/* LinkedIn-style actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setShowComposer(true);   // 1 click to comment
            setShowComments(false);  // list stays hidden unless user opens it
          }}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/60"
        >
          💬 <span>Comment</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const next = !showComments;
            setShowComments(next);
            setShowComposer(true); // keep input visible
            if (next) loadComments();
          }}
          className="text-sm text-[#4B5B55] hover:underline"
        >
          {showComments ? "Hide comments" : "View comments"}
        </button>
      </div>

      {showComposer ? (
        <div className="mt-2 rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-3">
          <ReplyComposer placeholder="Write a comment…" onSubmit={submitTopLevel} />

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
      ) : null}
    </div>
  );
}