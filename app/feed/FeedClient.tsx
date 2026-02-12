"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AvatarMenu from "@/app/components/AvatarMenu";

type ApiProfile = {
  username: string | null;
  avatarUrl: string | null;
  traderStyle: string | null;
};

type ApiPost = {
  id: string;
  content: string;
  createdAt: string;
  profile: ApiProfile | null;
};

export default function FeedClient() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const [me, setMe] = useState<{ username: string | null; avatarUrl: string | null } | null>(null);

  const canPost = useMemo(() => content.trim().length > 0 && !posting, [content, posting]);

  async function loadMe() {
    try {
      const res = await fetch("/api/profile/me", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) return;
      setMe({
        username: json?.profile?.username ?? null,
        avatarUrl: json?.profile?.avatar_url ?? null,
      });
    } catch {
      // ignore
    }
  }

  async function loadPosts(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load");
      setPosts(Array.isArray(json?.posts) ? json.posts : []);
    } catch {
      // keep whatever was there
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function submitPost() {
    const text = content.trim();
    if (!text) return;

    setPosting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to post");

      if (json?.post) {
        setPosts((prev) => [json.post as ApiPost, ...prev]);
      } else {
        await loadPosts(true);
      }

      setContent("");
    } catch {
      // ignore for now (you can add toast later)
    } finally {
      setPosting(false);
    }
  }

  useEffect(() => {
    (async () => {
      await Promise.all([loadMe(), loadPosts(false)]);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      {/* Top-right fixed brand */}
      <Link
        href="/feed"
        className="fixed right-6 top-6 z-50 rounded-full border border-[#D7E4DD] bg-white px-3 py-2 shadow-sm hover:shadow"
        aria-label="Core"
        title="Core"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/core-mark.png"
          alt="Core"
          className="h-6 w-6 object-contain"
        />
      </Link>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Feed</h1>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={submitPost}
              disabled={!canPost}
              className="rounded-2xl bg-[#22C55E] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {posting ? "Posting…" : "Post"}
            </button>

            <button
              type="button"
              onClick={() => loadPosts(true)}
              disabled={refreshing}
              className="rounded-2xl border border-[#D7E4DD] bg-white px-5 py-2 text-sm font-medium hover:shadow-sm disabled:opacity-50"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>

            <AvatarMenu avatarUrl={me?.avatarUrl ?? null} username={me?.username ?? null} />
          </div>
        </div>

        {/* Composer */}
        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a post…"
            className="min-h-[120px] w-full resize-none rounded-2xl border border-[#D7E4DD] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#22C55E]/20"
          />
          <div className="mt-3 flex items-center justify-between text-xs text-[#6B7A74]">
            <div>{content.trim().length}/20000</div>
            <div>Keep it short. No spam.</div>
          </div>
        </div>

        {/* Feed list */}
        {loading ? (
          <div className="text-sm text-[#6B7A74]">Loading…</div>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => {
              const username = p.profile?.username ?? "unknown";
              const style = p.profile?.traderStyle ?? "—";
              const when = new Date(p.createdAt).toLocaleString();

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full border border-[#D7E4DD] bg-[#F7FAF8]" />
                      <div>
                        <div className="font-semibold">@{username}</div>
                        <div className="text-xs text-[#6B7A74]">{style}</div>
                      </div>
                    </div>
                    <div className="text-xs text-[#6B7A74]">{when}</div>
                  </div>

                  <div className="mt-3 whitespace-pre-wrap text-sm">{p.content}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}