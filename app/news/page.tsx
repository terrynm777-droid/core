// app/news/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type NewsItem = {
  title: string;
  source: string;
  url: string;
  image: string;
  publishedAt: string;
  description: string;
};

const CATEGORY_OPTIONS = [
  { key: "general", label: "Top" },
  { key: "business", label: "Business" },
  { key: "technology", label: "Tech" }, // UI label; mapped to API
];

const TOPIC_PRESETS: { key: string; label: string; q: string; category?: string }[] = [
  { key: "top", label: "📰 Top", q: "", category: "general" },

  // broad
  { key: "world", label: "🌍 World", q: "world OR global OR international" },
  { key: "geopolitics", label: "🛰️ Geopolitics", q: "geopolitics OR conflict OR sanctions OR election" },
  { key: "policy", label: "🏛️ Policy", q: "policy OR regulation OR government" },

  // tech / science
  { key: "ai", label: "🤖 AI", q: "AI OR artificial intelligence OR OpenAI OR Nvidia", category: "technology" },
  { key: "tech", label: "💻 Tech", q: "technology OR software OR hardware OR chips", category: "technology" },
  { key: "science", label: "🔬 Science", q: "science OR research OR breakthrough OR study" },
  { key: "space", label: "🚀 Space", q: "space OR NASA OR rocket OR satellite" },

  // health / environment
  { key: "health", label: "🧬 Health", q: "health OR medicine OR hospital OR disease OR vaccine" },
  { key: "climate", label: "🌱 Climate", q: "climate OR emissions OR renewable OR extreme weather" },

  // business / markets
  { key: "economy", label: "📈 Economy", q: "economy OR inflation OR rates OR recession", category: "business" },
  { key: "markets", label: "📊 Markets", q: "stocks OR earnings OR futures OR bonds", category: "business" },
  { key: "crypto", label: "🪙 Crypto", q: "crypto OR bitcoin OR ethereum OR blockchain" },
  { key: "fx", label: "💱 FX", q: "forex OR USD OR JPY OR AUD OR exchange rate" },

  // culture / sport
  { key: "culture", label: "🎭 Culture", q: "culture OR entertainment OR film OR music" },
  { key: "sports", label: "🏟️ Sports", q: "sports OR tournament OR league OR match" },
];

function mapUiCategoryToApi(cat: string) {
  // matches your /api/news route mapping keys
  if (cat === "technology") return "tech";
  return cat;
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [category, setCategory] = useState("general");
  const [q, setQ] = useState("");

  const apiCategory = useMemo(() => mapUiCategoryToApi(category), [category]);

  async function load(next?: { category?: string; q?: string }) {
    const nextCategory = typeof next?.category === "string" ? next!.category! : category;
    const nextQ = typeof next?.q === "string" ? next!.q! : q;

    setLoading(true);
    setErr(null);

    try {
      const sp = new URLSearchParams();
      sp.set("category", mapUiCategoryToApi(nextCategory));
      if (nextQ.trim()) sp.set("q", nextQ.trim());
      sp.set("pageSize", "30");

      const res = await fetch(`/api/news?${sp.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load news");

      setItems(Array.isArray(json?.items) ? json.items : []);
    } catch (e: any) {
      setItems([]);
      setErr(e?.message || "Failed to load news");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">News</h1>
            <div className="mt-1 text-sm text-[#6B7A74]">Global headlines (Finnhub)</div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/feed"
              className="rounded-2xl border border-[#D7E4DD] bg-white px-5 py-2 text-sm font-medium hover:shadow-sm"
            >
              Back
            </Link>

            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="rounded-2xl border border-[#D7E4DD] bg-white px-5 py-2 text-sm font-medium hover:shadow-sm"
            >
              Filters
            </button>

            <button
              type="button"
              onClick={() => load()}
              className="rounded-2xl bg-[#22C55E] px-5 py-2 text-sm font-medium text-white hover:opacity-95"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters panel (collapsible) */}
        {filtersOpen ? (
          <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Topics */}
              <div className="md:col-span-3">
                <div className="text-xs font-semibold text-[#6B7A74]">Topics</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TOPIC_PRESETS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => {
                        if (typeof t.category === "string") setCategory(t.category);
                        setQ(t.q);
                      }}
                      className="rounded-full border border-[#D7E4DD] bg-white px-3 py-1.5 text-sm font-medium hover:bg-[#F7FAF8]"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="text-xs font-semibold text-[#6B7A74]">Category</div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm outline-none"
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-[#6B7A74]">API category: {apiCategory}</div>
              </div>

              {/* Search */}
              <div className="md:col-span-2">
                <div className="text-xs font-semibold text-[#6B7A74]">Search</div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Keywords (AI, election, climate...)"
                  className="mt-2 w-full rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm outline-none"
                />
                <div className="mt-2 text-xs text-[#6B7A74]">
                  Tip: leave blank for Top; or pick a Topic preset.
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCategory("general");
                  setQ("");
                }}
                className="rounded-2xl border border-[#D7E4DD] bg-white px-5 py-2 text-sm font-medium hover:shadow-sm"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => {
                  setFiltersOpen(false);
                  load();
                }}
                className="rounded-2xl bg-[#22C55E] px-5 py-2 text-sm font-medium text-white hover:opacity-95"
              >
                Apply
              </button>
            </div>

            <div className="mt-3 text-xs text-[#6B7A74]">
              Note: Finnhub doesn’t support true “country news” filtering. This page is topic/search driven.
            </div>
          </div>
        ) : null}

        {/* Results */}
        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Top news</div>
            <div className="text-xs text-[#6B7A74]">{items.length} items</div>
          </div>

          {err ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div>
          ) : null}

          {loading ? (
            <div className="mt-4 text-sm text-[#6B7A74]">Loading…</div>
          ) : items.length === 0 ? (
            <div className="mt-8 text-sm text-[#6B7A74]">No results.</div>
          ) : (
            <div className="mt-4 space-y-4">
              {items.map((it, idx) => (
                <a
                  key={`${it.url}-${idx}`}
                  href={it.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-[#D7E4DD] bg-white p-4 hover:shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    {it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.image}
                        alt=""
                        className="h-16 w-24 rounded-xl border border-[#D7E4DD] object-cover"
                      />
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold leading-snug">{it.title}</div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-[#6B7A74]">
                        <span>{it.source || "Unknown"}</span>
                        {it.publishedAt ? <span>• {new Date(it.publishedAt).toLocaleString()}</span> : null}
                      </div>

                      {it.description ? (
                        <div className="mt-2 line-clamp-2 text-sm text-[#4B5B55]">{it.description}</div>
                      ) : null}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}