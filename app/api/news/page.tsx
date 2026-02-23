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

const COUNTRY_OPTIONS = [
  { key: "world", label: "🌍 World" },
  { key: "us", label: "🇺🇸 US" },
  { key: "jp", label: "🇯🇵 Japan" },
  { key: "au", label: "🇦🇺 Australia" },
  { key: "cn", label: "🇨🇳 China" },
  { key: "uk", label: "🇬🇧 UK" },
  { key: "eu", label: "🇪🇺 Europe" },
  { key: "in", label: "🇮🇳 India" },
];

const CATEGORY_OPTIONS = [
  { key: "general", label: "Top" },
  { key: "business", label: "Business" },
  { key: "technology", label: "Tech" }, // note: UI key, mapped in API
  { key: "crypto", label: "Crypto" },
  { key: "forex", label: "FX" },
];

function mapUiCategoryToApi(cat: string) {
  // keep your UI labels but match route.ts mapping keys
  if (cat === "technology") return "tech";
  return cat;
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [country, setCountry] = useState("world");
  const [category, setCategory] = useState("general");
  const [q, setQ] = useState("");

  const apiCategory = useMemo(() => mapUiCategoryToApi(category), [category]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const sp = new URLSearchParams();
      sp.set("country", country);
      sp.set("category", apiCategory);
      if (q.trim()) sp.set("q", q.trim());
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
              onClick={load}
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
              <div>
                <div className="text-xs font-semibold text-[#6B7A74]">Country</div>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm outline-none"
                >
                  {COUNTRY_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

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
              </div>

              <div>
                <div className="text-xs font-semibold text-[#6B7A74]">Search</div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Keywords (AI, earnings, election...)"
                  className="mt-2 w-full rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCountry("world");
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
              Note: “Country” is best-effort filtering (Finnhub doesn’t support country news directly).
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
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
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
                        className="h-16 w-24 rounded-xl object-cover border border-[#D7E4DD]"
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