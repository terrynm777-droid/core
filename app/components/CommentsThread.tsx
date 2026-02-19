"use client";

import { useEffect, useMemo, useState } from "react";
import ReplyComposer from "@/app/components/ReplyComposer";

type Author = { username: string | null; avatar_url: string | null } | null;

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  parent_comment_id: number | null;
  author?: Author;
};

function AuthorLine({ author }: { author?: Author }) {
  const u = author?.username ?? "unknown";
  return <span className="font-medium">@{u}</span>;
}

export default function CommentsThread({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [repliesByParent, setRepliesByParent] = useState<Record<string, Comment[]>>({});
  const [err, setErr] = useState<string | null>(null);
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

  const hasLoaded = useMemo(
    () => open && (loading || comments.length > 0 || !!err),
    [open, loading, comments.length, err]
  );

  async function loadComments() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/posts/${encodeURIComponent(postId)}/comments?limit=50&offset=0`,
        { cache: "no-store" }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load comments");
      const list = Array.isArray(json?.comments) ? (json.comments as any[]) : [];
      setComments(list as Comment[]);
    } catch (e: any) {
      setErr(e?.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  async function loadReplies(parentCommentId: string) {
    setLoadingReplies((p) => ({ ...p, [parentCommentId]: true }));
    try {
      const res = await fetch(
        `/api/comments/${encodeURIComponent(parentCommentId)}/replies?limit=50&offset=0`,
        { cache: "no-store" }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) return;
      const list = Array.isArray(json?.replies) ? (json.replies as any[]) : [];
      setRepliesByParent((prev) => ({ ...prev, [parentCommentId]: list as Comment[] }));
    } finally {
      setLoadingReplies((p) => ({ ...p, [parentCommentId]: false }));
    }
  }

  async function submitTopLevel(text: string) {
    setErr(null);
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || "Failed to reply");

    const created = json?.comment as Comment | undefined;
    if (created?.id) setComments((prev) => [...prev, created]);
    else await loadComments();
  }

  async function submitReply(parentCommentId: string, text: string) {
    setErr(null);
    const res = await fetch(`/api/comments/${encodeURIComponent(parentCommentId)}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text, postId }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || "Failed to reply");
    await loadReplies(parentCommentId);
  }

  useEffect(() => {
    if (open && !hasLoaded) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl border border-[#D7E4DD] bg-white px-3 py-1.5 text-sm hover:shadow-sm"
      >
        Reply {open ? "▲" : "▼"}
      </button>

      {open ? (
        <div className="mt-3 rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-3">
          <ReplyComposer placeholder="Write a reply…" onSubmit={submitTopLevel} />

          {err ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-red-700">
              {err}
            </div>
          ) : null}

          <div className="mt-3 space-y-3">
            {loading ? (
              <div className="text-xs text-[#6B7A74]">Loading…</div>
            ) : comments.length === 0 ? (
              <div className="text-xs text-[#6B7A74]">No replies yet.</div>
            ) : (
              comments.map((c) => {
                const replies = repliesByParent[c.id] ?? [];
                const busy = !!loadingReplies[c.id];

                return (
                  <div key={c.id} className="rounded-2xl border border-[#D7E4DD] bg-white p-3">
                    <div className="flex items-center justify-between text-xs text-[#6B7A74]">
                      <AuthorLine author={c.author} />
                      <span>{new Date(c.created_at).toLocaleString()}</span>
                    </div>

                    <div className="mt-1 whitespace-pre-wrap text-sm">{c.body}</div>

                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => loadReplies(c.id)}
                          disabled={busy}
                          className="rounded-xl border border-[#D7E4DD] bg-white px-2 py-1 text-xs hover:shadow-sm disabled:opacity-50"
                        >
                          {busy ? "Loading…" : `Load replies (${replies.length})`}
                        </button>
                      </div>

                      <div className="mt-2 space-y-2 border-l border-[#D7E4DD] pl-3">
                        {replies.map((r) => (
                          <div key={r.id} className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-2">
                            <div className="flex items-center justify-between text-xs text-[#6B7A74]">
                              <AuthorLine author={r.author} />
                              <span>{new Date(r.created_at).toLocaleString()}</span>
                            </div>
                            <div className="mt-1 whitespace-pre-wrap text-sm">{r.body}</div>
                          </div>
                        ))}

                        <ReplyComposer
                          placeholder="Reply to this comment…"
                          onSubmit={(text) => submitReply(c.id, text)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
