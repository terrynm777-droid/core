"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Post = { id: string; content: string; createdAt: string };

export default function FeedClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setPosts(data.posts || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Feed</h1>

          <div className="flex gap-3">
            <Link
              href="/create"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-[#22C55E] text-white font-medium hover:brightness-95"
            >
              Post
            </Link>
            <button
              onClick={load}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl border border-[#D7E4DD] bg-white font-medium hover:shadow-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="text-sm text-[#4B5A55]">Loading…</div>
          ) : err ? (
            <div className="rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-600">
              {err}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 text-sm text-[#4B5A55]">
              No posts yet.
            </div>
          ) : (
            posts.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm"
              >
                <div className="text-base font-medium whitespace-pre-wrap">
                  {p.content}
                </div>
                <div className="mt-3 text-xs text-[#6B7A74]">
                  {new Date(p.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}