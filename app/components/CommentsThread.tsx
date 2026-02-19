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

  async function loadComments() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/posts/${encodeURIComponent(postId)}/comments?limit=50&offset=0`,
        { cache: "no-store" }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load comments");
      setComments(Array.isArray(json?.comments) ? json.comments : []);
    } finally {
      setLoading(false);
    }
  }

  async function loadReplies(parentCommentId: string) {
    const res = await fetch(
      `/api/comments/${encodeURIComponent(parentCommentId)}/replies?limit=50&offset=0`,
      { cache: "no-store" }
    );
    const json = await res.json().catch(() => null);
    if (!res.ok) return;
    const replies = Array.isArray(json?.replies) ? json.replies : [];
    setRepliesByParent((prev) => ({ ...prev, [parentCommentId]: replies }));
  }

  // ✅ Step 6: always refresh after POST so it appears immediately
  async function submitTopLevel(text: string) {
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || "Failed to reply");

    await loadComments(); // <- guarantees it shows up
  }

  async function submitReply(parentCommentId: string, text: string) {
    const res = await fetch(`/api/comments/${encodeURIComponent(parentCommentId)}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text, postId }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || "Failed to reply");

    await loadReplies(parentCommentId); // refresh replies list
  }

  useEffect(() => {
    if (open) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="mt-3">
      <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-3">
        <ReplyComposer placeholder="Write a comment…" onSubmit={submitTopLevel} />

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-xs text-[#6B7A74]">Loading…</div>
          ) : comments.length === 0 ? (
            <div className="text-xs text-[#6B7A74]">No comments yet.</div>
          ) : (
            comments.map((c) => {
              const replies = repliesByParent[c.id] ?? [];
              return (
                <div key={c.id} className="rounded-2xl border border-[#D7E4DD] bg-white p-3">
                  <div className="flex items-center justify-between text-xs text-[#6B7A74]">
                    <AuthorLine author={c.author} />
                    <span>{new Date(c.created_at).toLocaleString()}</span>
                  </div>

                  <div className="mt-1 whitespace-pre-wrap text-sm">{c.body}</div>

                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => loadReplies(c.id)}
                      className="rounded-xl border border-[#D7E4DD] bg-white px-2 py-1 text-xs hover:shadow-sm"
                    >
                      Load replies ({replies.length})
                    </button>

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
    </div>
  );
}