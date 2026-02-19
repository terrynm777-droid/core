"use client";

import { useEffect, useMemo, useState } from "react";
import ReplyComposer from "@/app/components/ReplyComposer";

type Author =
  | {
      id: string;
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
    }
  | null;

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  parent_comment_id: string | null;
  author?: Author;
};

function Avatar({ url, label }: { url?: string | null; label: string }) {
  const initial = (label.trim()[0] ?? "?").toUpperCase();

  if (!url) {
    return (
      <div className="h-7 w-7 rounded-full bg-[#E6EFEA] text-[#4B5B55] flex items-center justify-center text-xs font-semibold">
        {initial}
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={label}
      className="h-7 w-7 rounded-full object-cover border border-[#D7E4DD]"
      referrerPolicy="no-referrer"
      onError={(e) => {
        // If broken, fall back to initials block by hiding the image.
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function AuthorLine({ author }: { author?: Author }) {
  const username = author?.username ?? "unknown";
  const display = author?.display_name ?? null;
  const label = display ? `${display} (@${username})` : `@${username}`;

  return (
    <div className="flex items-center gap-2">
      <Avatar url={author?.avatar_url} label={username} />
      <span className="font-medium">{label}</span>
    </div>
  );
}

export default function CommentsThread({
  postId,
  open = true,
}: {
  postId: string;
  open?: boolean;
}) {
  const [showComposer] = useState(open);
  const [showComments, setShowComments] = useState(false);

  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const countLabel = useMemo(() => {
    if (!loadedOnce) return "";
    if (total <= 0) return "";
    return `${total} comment(s)`;
  }, [total, loadedOnce]);

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

      const list = Array.isArray(json?.comments) ? (json.comments as Comment[]) : [];
      setComments(list);

      // prefer server total if provided, else fallback to list length
      setTotal(typeof json?.total === "number" ? json.total : list.length);

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

      if (created?.id) {
        setComments((prev) => [...prev, created]);
        setTotal((t) => t + 1);
      } else {
        await loadComments();
      }

      setShowComments(true);
      setLoadedOnce(true);
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    }
  }

  // preload once when composer opens (so “View comments” is instant)
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

        <div className="text-xs text-[#6B7A74]">{countLabel}</div>
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

                <div className="mt-2 whitespace-pre-wrap text-sm">{c.body}</div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}