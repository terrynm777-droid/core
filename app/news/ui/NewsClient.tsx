// app/news/ui/NewsClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type NewsItem = {
  title: string;
  source: string;
  url: string;
  image: string;
  publishedAt: string;
  description: string;
};

type NewsResponse = {
  ok: boolean;
  mode: "top" | "everything";
  country: string;
  category: string;
  q: string;
  items: NewsItem[];
};

const COUNTRIES = [
  { key: "world", label: "Worldwide" },
  { key: "us", label: "United States" },
  { key: "jp", label: "Japan" },
  { key: "au", label: "Australia" },
  { key: "cn", label: "China" },
  { key: "uk", label: "United Kingdom" },
  { key: "in", label: "India" },
];

const CATEGORIES = [
  { key: "general", label: "Top" },
  { key: "business", label: "Business" },
  { key: "markets", label: "Markets" },       // mapped to keyword preset in API (everything mode)
  { key: "tech", label: "Tech" },             // preset
  { key: "geopolitics", label: "Geopolitics" }, // preset
  { key: "health", label: "Health" },
  { key: "science", label: "Science" },
  { key: "sports", label: "Sports" },
  { key: "jp_ja", label: "🇯🇵 日本語", q: "__JP_JA__" },
];

const SORTS = [
  { key: "publishedAt", label: "Latest" },
  { key: "relevancy", label: "Relevance" },
  { key: "popularity", label: "Popularity" },
];

const HOURS = [
  { key: "24", label: "24h" },
  { key: "168", label: "7d" },
  { key: "720", label: "30d" },
];

const SUGGEST = [
  "AI",
  "earnings",
  "rates",
  "inflation",
  "Japan",
  "China",
  "NVIDIA",
  "Apple",
  "Tesla",
  "Bitcoin",
  "oil",
  "election",
];

async function fetchJsonOrThrow(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}
  if (!res.ok) throw new Error(json?.error || text || "Request failed");
  return json;
}

export default function NewsClient() {
  const [country, setCountry] = useState("world");
  const [category, setCategory] = useState("general");
  const [sort, setSort] = useState("publishedAt");
  const [hours, setHours] = useState("24");
  const [q, setQ] = useState("");
  const [kw, setKw] = useState(""); // dropdown keyword
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<NewsItem[]>([]);

  const effectiveQuery = useMemo(() => {
    const k = (kw || "").trim();
    const s = (q || "").trim();
    return s ? s : k;
  }, [q, kw]);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams({
      country,
      category,
      sort,
      hours,
    });

    // If searching or using presets, API will auto switch to /everything
    if (effectiveQuery) params.set("q", effectiveQuery);

    return `/api/news?${params.toString()}`;
  }, [country, category, sort, hours, effectiveQuery]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    fetchJsonOrThrow(apiUrl)
      .then((j: NewsResponse) => {
        if (!alive) return;
        setItems(Array.isArray(j?.items) ? j.items : []);
      })
      .catch((e: any) => {
        if (!alive) return;
        setErr(e?.message || "Failed to load news");
        setItems([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [apiUrl]);

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      {/* Filters */}
      <div className="rounded-2xl border border-[#D7E4DD] bg-white p-4 space-y-3">
        <div className="text-sm font-semibold text-[#0B0F0E]">Filters</div>

        <div className="space-y-1">
          <div className="text-xs text-[#6B7A74]">Country</div>
          <select
            className="w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-[#6B7A74]">Category</div>
          <select
            className="w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-[#6B7A74]">Time</div>
            <select
              className="w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            >
              {HOURS.map((h) => (
                <option key={h.key} value={h.key}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-[#6B7A74]">Sort</div>
            <select
              className="w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-[#6B7A74]">Search</div>
          <input
            className="w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type keywords (AI, earnings, election...)"
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs text-[#6B7A74]">Quick keywords</div>
          <select
            className="w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
            value={kw}
            onChange={(e) => setKw(e.target.value)}
          >
            <option value="">—</option>
            {SUGGEST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="text-[11px] text-[#6B7A74]">
            If Search box has text, it overrides the dropdown.
          </div>
        </div>

        <button
          className="w-full rounded-xl border border-[#D7E4DD] bg-[#0B0F0E] px-3 py-2 text-sm font-semibold text-white"
          onClick={() => {
            setQ("");
            setKw("");
            setCategory("general");
            setCountry("world");
            setSort("publishedAt");
            setHours("24");
          }}
        >
          Reset
        </button>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-[#D7E4DD] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-[#0B0F0E]">Top news</div>
          <div className="text-xs text-[#6B7A74]">{loading ? "Loading…" : `${items.length} items`}</div>
        </div>

        {err ? <div className="mb-3 text-sm text-red-700">{err}</div> : null}

        <div className="divide-y divide-[#E6EEE9]">
          {items.map((it) => (
            <a
              key={it.url}
              href={it.url}
              target="_blank"
              rel="noreferrer"
              className="block py-3 hover:bg-[#F7FAF8] rounded-xl px-2"
            >
              <div className="flex gap-3">
                <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-[#D7E4DD] bg-[#F7FAF8]">
                  {it.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#0B0F0E] line-clamp-2">{it.title}</div>
                  <div className="mt-1 text-xs text-[#6B7A74]">
                    {it.source || "Unknown"} • {it.publishedAt ? new Date(it.publishedAt).toLocaleString() : ""}
                  </div>
                  {it.description ? (
                    <div className="mt-1 text-xs text-[#4B5B55] line-clamp-2">{it.description}</div>
                  ) : null}
                </div>
              </div>
            </a>
          ))}

          {!loading && !items.length ? (
            <div className="py-10 text-center text-sm text-[#6B7A74]">No results.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}