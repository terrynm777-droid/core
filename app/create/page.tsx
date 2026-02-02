"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const text = content.trim();
    if (!text) return setErr("Type something first.");

    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to post");

      router.push("/feed");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Failed to post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold">Create post</h1>
        <p className="mt-2 text-sm text-[#4B5A55]">Text-only for now. Images later.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What’s the signal?"
            className="w-full min-h-[160px] rounded-2xl border border-[#D7E4DD] bg-white p-4 outline-none focus:ring-2 focus:ring-[#22C55E]"
            maxLength={500}
          />
          <div className="flex items-center justify-between text-xs text-[#6B7A74]">
            <span>{content.trim().length}/500</span>
            {err ? <span className="text-red-600">{err}</span> : <span />}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-[#22C55E] text-white font-medium hover:brightness-95 disabled:opacity-60"
            >
              {loading ? "Posting..." : "Post"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/feed")}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl border border-[#D7E4DD] bg-white font-medium hover:shadow-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}