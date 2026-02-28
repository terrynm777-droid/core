"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AvatarMenu from "@/app/components/AvatarMenu";
import PostActions from "@/app/components/PostActions";
import LinkPreview from "@/app/components/LinkPreview";
import { firstUrl, renderWithLinks } from "@/app/components/textLinks";
import { useAttachments } from "@/app/components/useAttachments";

type ApiPost = {
  id: string;
  content: string;
  createdAt: string;
   commentsCount: number; // ✅ ADD
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

type SymbolHit = { symbol: string; name?: string; type?: string };

function clean(s: string) {
  return (s ?? "").trim();
}

function isProbablyTicker(s: string) {
  // AAPL, TSLA, 7203.T, BRK.B, RIO.AX etc
  const t = s.trim().toUpperCase();
  if (!t) return false;
  if (t.length > 20) return false; // allow longer suffixes like BRK.B / 7203.T / RIO.AX
  return /^[A-Z0-9.\-]{1,20}$/.test(t) && /[A-Z0-9]/.test(t);
}

// ✅ ONE canonical stock route.
// Make sure you have: app/s/[symbol]/page.tsx (and StockPageClient next to it if you use it)
function stockHref(symbol: string) {
  return `/s/${encodeURIComponent(symbol.toUpperCase())}`;
}

export default function FeedClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const feed = (sp.get("feed") === "ja" ? "ja" : "en") as "en" | "ja";

  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [me, setMe] = useState<MeProfile | null>(null);
  const [content, setContent] = useState("");
  const {
  attachments,
  AttachmentButton,
  AttachmentInput,
} = useAttachments();

  // search
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [symHits, setSymHits] = useState<SymbolHit[]>([]);
  const [searching, setSearching] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);

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
      const res = await fetch(`/api/posts?feed=${feed}`, { cache: "no-store" });
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
    setPosts([]);
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed]);

  async function createPost() {
    const text = content.trim();
    if (!text) return;

    setErr(null);
    setPosting(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          feed, // "en" | "ja"
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to post");

      const newPost = json?.post;
      if (newPost?.id) {
        setPosts((prev) => [newPost, ...prev]);
      } else {
        await loadPosts();
      }

      setContent("");
    } catch (e: any) {
      setErr(e?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  }

  // live stock search via /api/symbols
  useEffect(() => {
    const text = clean(q);
    if (!text) {
      setSymHits([]);
      setSearching(false);
      return;
    }

    // only fetch symbols if it doesn't look like @username
    if (text.startsWith("@")) {
      setSymHits([]);
      setSearching(false);
      return;
    }

    const t = text;
    const controller = new AbortController();
    searchAbortRef.current?.abort();
    searchAbortRef.current = controller;

    const id = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/symbols?q=${encodeURIComponent(t)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "search failed");
        const hits = Array.isArray(json?.results) ? (json.results as any[]) : [];
        setSymHits(
          hits
            .slice(0, 8)
            .map((x) => ({
              symbol: String(x.symbol || ""),
              name: x.name,
              type: x.type,
            }))
            .filter((x) => x.symbol)
        );
      } catch {
        setSymHits([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(id);
  }, [q]);

  function goSearch(input: string) {
    const text = clean(input);
    if (!text) return;

    // @username
    if (text.startsWith("@")) {
      const uname = clean(text.slice(1));
      if (uname) router.push(`/u/${encodeURIComponent(uname)}`);
      return;
    }

    // ticker-like → stock page
    if (isProbablyTicker(text)) {
      router.push(stockHref(text));
      return;
    }

    // fallback → headlines search
    router.push(`/headlines?q=${encodeURIComponent(text)}`);
  }

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Feed</h1>

          {/* SEARCH (middle) */}
          <div className="relative flex-1 max-w-md">
            <div className="flex items-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2">
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => {
                  // small delay so click works
                  setTimeout(() => setOpen(false), 120);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setOpen(false);
                    goSearch(q);
                  }
                  if (e.key === "Escape") setOpen(false);
                }}
                placeholder="Search ticker, @username, or news…"
                className="w-full bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  goSearch(q);
                }}
                className="ml-2 rounded-xl border border-[#D7E4DD] bg-[#F7FAF8] px-3 py-1 text-xs font-medium hover:shadow-sm"
              >
                Search
              </button>
            </div>

            {/* DROPDOWN */}
            {open && (q.trim() || symHits.length > 0) ? (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[#D7E4DD] bg-white shadow-sm">
                <div className="px-4 py-2 text-xs text-[#6B7A74]">
                  {q.trim().startsWith("@")
                    ? "Profile"
                    : searching
                      ? "Searching…"
                      : symHits.length
                        ? "Stocks"
                        : "Press Enter to search news"}
                </div>

                {/* quick profile jump */}
                {q.trim().startsWith("@") ? (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setOpen(false);
                      goSearch(q);
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-[#F7FAF8]"
                  >
                    View profile <span className="font-semibold">{q.trim()}</span>
                  </button>
                ) : symHits.length ? (
                  <div>
                    {symHits.map((h) => (
                      <button
                        key={h.symbol}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setOpen(false);
                          router.push(stockHref(h.symbol));
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-[#F7FAF8]"
                      >
                        <div className="text-sm font-semibold">{String(h.symbol || "").toUpperCase()}</div>
                        {h.name ? <div className="text-xs text-[#6B7A74]">{h.name}</div> : null}
                      </button>
                    ))}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setOpen(false);
                        goSearch(q);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-[#4B5B55] hover:bg-[#F7FAF8]"
                    >
                      Search news for “{q.trim()}”
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setOpen(false);
                      goSearch(q);
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-[#F7FAF8]"
                  >
                    Search news for “{q.trim()}”
                  </button>
                )}
              </div>
            ) : null}
          </div>

          {/* RIGHT SIDE */}
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

        {/* COMPOSER */}
        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-4 shadow-sm">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a post…"
            className="min-h-[96px] w-full resize-none rounded-2xl border border-[#D7E4DD] bg-white p-4 text-sm outline-none"
          />

          {/* bottom row: count + posting-as + post button on bottom-right */}
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#6B7A74]">
            <span>{content.length}/20000</span>

            <div className="flex items-center gap-3">
              {me?.username ? (
                <Link href={`/u/${encodeURIComponent(me.username)}`} className="hover:underline">
                  Posting as @{me.username}
                </Link>
              ) : (
                <Link href="/settings/profile" className="hover:underline">
                  Set up profile
                </Link>
              )}

              <button
                type="button"
                onClick={createPost}
                disabled={posting || !content.trim()}
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
                        <Link href={profileHref} className="block text-xs text-[#6B7A74] hover:underline">
                          {style}
                        </Link>
                      ) : (
                        <div className="text-xs text-[#6B7A74]">{style}</div>
                      )}
                    </div>

                    <div className="text-xs text-[#6B7A74]">{when}</div>
                  </div>

                

<div className="mt-3 whitespace-pre-wrap text-sm">
  {renderWithLinks(p.content)}
</div>

<LinkPreview url={firstUrl(p.content)} />

                  <PostActions
  postId={p.id}
  commentsCount={p.commentsCount}
/>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}