"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AvatarMenu from "@/app/components/AvatarMenu";
import PostActions from "@/app/components/PostActions";

type ApiPost = {
  id: string;
  content: string;
  createdAt: string;
  profile: {
    id: string | null;
    username: string | null;
    avatarUrl: string | null;
    traderStyle: string | null;
  } | null;
};

type MeProfile = {
  id: string | null;
  username: string | null;
  avatarUrl: string | null;
};

export default function FeedClient() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [me, setMe] = useState<MeProfile | null>(null);
  const [content, setContent] = useState("");

  async function loadMe() {
    try {
      const res = await fetch("/api/profile/me", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) return;

      setMe({
        id: json?.profile?.id ?? null,
        username: json?.profile?.username ?? null,
        avatarUrl: json?.profile?.avatarUrl ?? null,
      });
    } catch {}
  }

  async function loadPosts() {
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load feed");

      setPosts(Array.isArray(json?.posts) ? json.posts : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
    loadPosts();
  }, []);

  async function createPost() {
    const text = content.trim();
    if (!text || posting) return;

    setErr(null);
    setPosting(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to post");

      const newPost = json?.post as ApiPost | undefined;
      if (newPost?.id) setPosts((prev) => [newPost, ...prev]);
      else await loadPosts();

      setContent("");
    } catch (e: any) {
      setErr(e?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  }

  const canPost = !!content.trim() && !posting;

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Feed</h1>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadPosts}
              className="rounded-2xl border border-[#D7E4DD] bg-white px-5 py-2 text-sm font-medium hover:shadow-sm"
            >
              Refresh
            </button>

            <AvatarMenu me={me} />
          </div>
        </div>

        {/* composer */}
        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-4 shadow-sm">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a post…"
            className="min-h-[96px] w-full resize-none rounded-2xl border border-[#D7E4DD] bg-white p-4 text-sm outline-none"
            maxLength={20000}
          />

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-[#6B7A74]">{content.length}/20000</div>

            <div className="flex items-center gap-3">
              {me?.username ? (
                <Link
                  href={`/u/${encodeURIComponent(me.username)}`}
                  className="text-xs text-[#6B7A74] hover:underline"
                >
                  Posting as @{me.username}
                </Link>
              ) : (
                <Link href="/settings/profile" className="text-xs text-[#6B7A74] hover:underline">
                  Set up profile
                </Link>
              )}

              {/* ✅ post button moved into composer (bottom-right) */}
              <button
                type="button"
                onClick={createPost}
                disabled={!canPost}
                className="rounded-2xl bg-[#22C55E] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>

        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {loading ? (
          <div className="text-sm text-[#6B7A74]">Loading…</div>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => {
              const username = p.profile?.username ?? "unknown";
              const style = p.profile?.traderStyle ?? "—";
              const when = new Date(p.createdAt).toLocaleString();
              const profileHref = username !== "unknown" ? `/u/${encodeURIComponent(username)}` : null;

              return (
                <div key={p.id} className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {profileHref ? (
                        <Link href={profileHref} className="font-semibold hover:underline">
                          @{username}
                        </Link>
                      ) : (
                        <div className="font-semibold text-[#6B7A74]">@unknown</div>
                      )}

                      {profileHref ? (
                        <Link
                          href={profileHref}
                          className="block text-xs text-[#6B7A74] hover:underline"
                          title="Open profile"
                        >
                          {style}
                        </Link>
                      ) : (
                        <div className="text-xs text-[#6B7A74]">{style}</div>
                      )}
                    </div>

                    <div className="text-xs text-[#6B7A74]">{when}</div>
                  </div>

                  <div className="mt-3 whitespace-pre-wrap text-sm">{p.content}</div>

                  <PostActions postId={p.id} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}