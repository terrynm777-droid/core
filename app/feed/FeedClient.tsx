"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ApiPost = {
  id: string;
  content: string;
  createdAt: string;
  profile: {
    username: string | null;
    avatarUrl: string | null;
    bio: string | null;
    traderStyle: string | null;
  } | null;
};

type MeProfile = {
  username: string | null;
};

export default function FeedClient() {
  const router = useRouter();

  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [content, setContent] = useState("");

  const [me, setMe] = useState<MeProfile>({ username: null });

  const profileHref = useMemo(() => {
    const u = (me.username || "").trim();
    if (!u) return "/settings/profile";
    return `/u/${u}`;
  }, [me.username]);

  async function loadMe() {
    try {
      const res = await fetch("/api/profile/me", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        setMe({ username: json?.profile?.username ?? null });
      }
    } catch {
      // ignore
    }
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

  async function onPost() {
    const v = content.trim();
    if (!v) return;

    setPosting(true);
    setErr(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: v }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Post failed");
      setContent("");
      await loadPosts();
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Post failed");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Feed</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={onPost}
            disabled={posting || !content.trim()}
            className="rounded-2xl bg-[#22C55E] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {posting ? "Posting…" : "Post"}
          </button>

          <button
            onClick={loadPosts}
            className="rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2.5 text-sm font-medium hover:shadow-sm"
          >
            Refresh
          </button>

          <Link
            href={profileHref}
            className="rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2.5 text-sm font-medium hover:shadow-sm"
          >
            Profile
          </Link>

          <Link
            href="/settings/profile"
            className="rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2.5 text-sm font-medium hover:shadow-sm"
          >
            Edit profile
          </Link>

          <Link
            href="/settings/portfolio"
            className="rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2.5 text-sm font-medium hover:shadow-sm"
          >
            Edit portfolio
          </Link>

          <Link
            href="/auth/signout"
            className="rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2.5 text-sm font-medium hover:shadow-sm"
          >
            Sign out
          </Link>
        </div>
      </div>

      {/* Composer */}
      <div className="mt-6 rounded-2xl border border-[#D7E4DD] bg-white p-4 shadow-sm">
        <textarea
          className="w-full min-h-[96px] rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          placeholder="Write a post…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {err ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {/* Feed */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="text-sm text-[#6B7A74]">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="text-sm text-[#6B7A74]">No posts yet.</div>
        ) : (
          posts.map((p) => {
            const username = p.profile?.username || "unknown";
            const style = p.profile?.traderStyle || "—";
            const when = new Date(p.createdAt).toLocaleString();

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">@{username}</div>
                    <div className="text-xs text-[#6B7A74]">{style}</div>
                  </div>
                  <div className="text-xs text-[#6B7A74]">{when}</div>
                </div>

                <div className="mt-3 whitespace-pre-wrap text-sm">{p.content}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}