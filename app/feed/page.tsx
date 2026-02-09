"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Post = { id: string; content: string; createdAt: string };

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const hasPosts = useMemo(() => posts.length > 0, [posts.length]);

  async function load(mode: "initial" | "refresh" = "refresh") {
    setErr(null);

    if (mode === "initial") setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setPosts(data?.posts || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load("initial");
  }, []);

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E]">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#6B7A74]">
              CORE
            </div>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">
              Feed
            </h1>
            <p className="mt-2 text-sm text-[#6B7A74]">
              Signal over noise.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/create"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-[#22C55E] text-white font-medium hover:bg-[#16A34A] transition"
            >
              Post
            </Link>

            <button
              onClick={() => load("refresh")}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl border border-[#D7E4DD] bg-white font-medium hover:bg-[#F3F7F5] transition disabled:opacity-60"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 text-sm text-[#4B5A55]">
              Loading…
            </div>
          ) : err ? (
            <div className="rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-600">
              {err}
            </div>
          ) : !hasPosts ? (
            <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 text-sm text-[#4B5A55]">
              No posts yet.
            </div>
          ) : (
            posts.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm"
              >
                <div className="text-[15px] leading-7 text-[#0B0F0E] whitespace-pre-wrap">
                  {p.content}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-[#6B7A74]">
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}