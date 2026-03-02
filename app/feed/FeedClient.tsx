"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AvatarMenu from "@/app/components/AvatarMenu";
import PostActions from "@/app/components/PostActions";
import { useAttachments } from "@/app/components/useAttachments";
import LinkPreview from "@/app/components/LinkPreview";
import { firstUrl, renderWithLinks } from "@/app/components/textLinks";

type DbAttachment = { kind: "image" | "video"; url: string; name?: string };

type ApiPost = {
  id: string;
  content: string;
  createdAt: string;
  commentsCount: number;
  profile: {
    id: string | null;
    username: string | null;
    avatarUrl: string | null;
    traderStyle: string | null;
  } | null;
  attachments?: DbAttachment[] | null;
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

function Avatar({ url, label }: { url?: string | null; label: string }) {
  const [broken, setBroken] = useState(false);
  const initial = (label.trim()[0] ?? "?").toUpperCase();

  if (!url || broken) {
    return (
      <div className="h-8 w-8 rounded-full bg-[#E6EFEA] text-[#4B5B55] flex items-center justify-center text-xs font-semibold">
        {initial}
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={label}
      className="h-8 w-8 rounded-full object-cover border border-[#D7E4DD]"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  );
}

function isProbablyTicker(s: string) {
  const t = s.trim().toUpperCase();
  if (!t) return false;
  if (t.length > 20) return false;
  return /^[A-Z0-9.\-]{1,20}$/.test(t) && /[A-Z0-9]/.test(t);
}

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
    attachments, // {id, kind, previewUrl?, url?, uploading?, error?}
    uploading,
    setAttachments,
    removeAttachment,
    AttachmentButton,
    AttachmentInput,
    onDrop,
    onDragOver,
  } = useAttachments();

  const inFlightRef = useRef(false);

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
      setPosts(Array.isArray(json?.posts) ? (json.posts as ApiPost[]) : []);
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
    if (inFlightRef.current || posting || uploading) return;

    // if any still uploading, block post
    if (attachments.some((a: any) => a.uploading)) {
      setErr("Wait for uploads to finish.");
      return;
    }

    const text = content.trim();

    // only real URLs go to DB
    const attSnapshot: DbAttachment[] = attachments
      .filter((a: any) => !!a.url)
      .map((a: any) => ({
        kind: a.kind,
        url: String(a.url),
        name: a.name,
      }));

    if (!text && attSnapshot.length === 0) return;

    inFlightRef.current = true;
    setPosting(true);
    setErr(null);

    const payload = { content: text, feed, attachments: attSnapshot };

    // clear UI immediately
    setContent("");
    setAttachments([]);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to post");

      const newPost = json?.post as ApiPost | undefined;
      if (newPost?.id) {
        setPosts((prev) => [newPost, ...prev]);
      } else {
        await loadPosts();
      }
    } catch (e: any) {
      // restore on failure
      setContent(payload.content);
      setAttachments(
        payload.attachments.map((a) => ({
          id: `${Date.now()}-${Math.random()}`,
          kind: a.kind,
          url: a.url,
          name: a.name,
          uploading: false,
        }))
      );
      setErr(e?.message || "Failed to post");
    } finally {
      setPosting(false);
      inFlightRef.current = false;
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

    if (text.startsWith("@")) {
      const uname = clean(text.slice(1));
      if (uname) router.push(`/u/${encodeURIComponent(uname)}`);
      return;
    }

    if (isProbablyTicker(text)) {
      router.push(stockHref(text));
      return;
    }

    router.push(`/headlines?q=${encodeURIComponent(text)}`);
  }

  // allow attachment-only posts (but only after upload finished)
  const composerCanPost =
    !posting &&
    !uploading &&
    (content.trim().length > 0 ||
      attachments.some((a: any) => !!a.url) ||
      attachments.some((a: any) => !!a.previewUrl));

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Feed</h1>

          {/* SEARCH */}
          <div className="relative flex-1 max-w-md">
            <div className="flex items-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2">
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
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

        {/* COMPOSER (drag/drop enabled) */}
        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-4 shadow-sm" onDrop={onDrop} onDragOver={onDragOver}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a post…"
            className="min-h-[96px] w-full resize-none rounded-2xl border border-[#D7E4DD] bg-white p-4 text-sm outline-none"
          />

          <div className="mt-2 flex items-center gap-2">
            <AttachmentButton />
            <AttachmentInput />
            <div className="text-xs text-[#6B7A74]">
              {uploading ? "Uploading…" : attachments.length ? `${attachments.length} file(s) selected` : null}
            </div>
          </div>

          {attachments.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachments.map((a: any) => {
                const src = a.url ?? a.previewUrl ?? "";
                if (!src) return null;

                return (
                  <div key={a.id} className="relative">
                    {a.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={a.name || ""}
                        className="h-16 w-24 rounded-xl border border-[#D7E4DD] object-cover"
                      />
                    ) : (
                      <video
                        src={src}
                        className="h-16 w-24 rounded-xl border border-[#D7E4DD] object-cover"
                        muted
                        playsInline
                        controls
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => removeAttachment(a.id)}
                      className="absolute -right-2 -top-2 rounded-full border border-[#D7E4DD] bg-white px-2 text-xs"
                      disabled={posting || uploading}
                    >
                      ×
                    </button>

                    {a.uploading ? (
                      <div className="absolute bottom-1 left-1 rounded bg-white/90 px-2 py-0.5 text-[10px] text-[#6B7A74]">
                        Uploading…
                      </div>
                    ) : a.error ? (
                      <div className="absolute bottom-1 left-1 rounded bg-white/90 px-2 py-0.5 text-[10px] text-red-600">
                        {a.error}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}

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
                disabled={!composerCanPost}
                className="rounded-2xl bg-[#22C55E] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>

        {err ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div> : null}

        {loading ? (
          <div className="text-sm text-[#6B7A74]">Loading…</div>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => {
              const username = p.profile?.username ?? "unknown";
              const style = p.profile?.traderStyle ?? "—";
              const when = new Date(p.createdAt).toLocaleString();
              const profileHref = username !== "unknown" ? `/u/${encodeURIComponent(username)}` : null;
              const url = firstUrl(p.content);

              return (
                <div key={p.id} className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar url={p.profile?.avatarUrl ?? null} label={username} />
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
                    </div>

                    <div className="text-xs text-[#6B7A74]">{when}</div>
                  </div>

                  <div className="mt-3 whitespace-pre-wrap text-sm">{renderWithLinks(p.content)}</div>

                  {url ? <LinkPreview url={url} /> : null}

                  {Array.isArray(p.attachments) && p.attachments.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.attachments.map((a) => (
                        <div key={a.url} className="relative">
                          {a.kind === "image" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={a.url}
                              alt={a.name || ""}
                              className="h-28 w-40 rounded-2xl border border-[#D7E4DD] object-cover"
                            />
                          ) : (
                            <video
                              src={a.url}
                              controls
                              className="h-28 w-40 rounded-2xl border border-[#D7E4DD] object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <PostActions postId={p.id} commentsCount={p.commentsCount} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}