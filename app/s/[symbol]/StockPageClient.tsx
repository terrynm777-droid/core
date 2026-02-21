"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Quote = {
  symbol: string;
  current: number;
  prevClose: number;
  change: number;
  changePct: number;
};

type ChartPoint = { t: string; c: number };

type NewsItem = {
  headline: string;
  url: string;
  source?: string | null;
  datetime?: number | null;
  summary?: string | null;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function buildLinePoints(values: number[], w: number, h: number, pad = 8) {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  return values
    .map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(values.length - 1, 1);
      const y = pad + (1 - (v - min) / span) * (h - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function fmt(n: number) {
  if (!isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function StockPageClient({ symbol }: { symbol: string }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const [qRes, cRes, nRes] = await Promise.all([
        fetch(`/api/stocks/quote?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" }),
        fetch(`/api/stocks/chart?symbol=${encodeURIComponent(symbol)}&range=6m`, { cache: "no-store" }),
        fetch(`/api/stocks/news?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" }),
      ]);

      const qJson = await qRes.json().catch(() => null);
      const cJson = await cRes.json().catch(() => null);
      const nJson = await nRes.json().catch(() => null);

      if (!qRes.ok) throw new Error(qJson?.error || "Failed to load quote");
      if (!cRes.ok) throw new Error(cJson?.error || "Failed to load chart");
      if (!nRes.ok) throw new Error(nJson?.error || "Failed to load news");

      setQuote(qJson?.quote ?? null);
      setChart(Array.isArray(cJson?.points) ? cJson.points : []);
      setNews(Array.isArray(nJson?.items) ? nJson.items : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  const W = 640;
  const H = 180;

  const closeVals = useMemo(() => chart.map((p) => Number(p.c ?? 0)).filter((x) => isFinite(x)), [chart]);
  const poly = useMemo(() => buildLinePoints(closeVals, W, H, 10), [closeVals]);

  const dayBadge = useMemo(() => {
    const pct = Number(quote?.changePct ?? 0);
    const sign = pct > 0 ? "+" : "";
    const isDown = pct < 0;
    return { text: `${sign}${pct.toFixed(2)}%`, isDown };
  }, [quote]);

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/feed"
            className="inline-flex items-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Back to feed
          </Link>

          <button
            type="button"
            onClick={load}
            className="rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Refresh
          </button>
        </div>

        {/* Header */}
        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-semibold">{symbol}</div>
              <div className="mt-1 text-sm text-[#6B7A74]">Quote + 6M chart</div>
            </div>

            <div className="text-right">
              <div className="text-xs text-[#6B7A74]">Price</div>
              <div className="text-2xl font-semibold">{fmt(Number(quote?.current ?? NaN))}</div>
              <div className={`text-sm font-semibold ${dayBadge.isDown ? "text-red-600" : "text-[#22C55E]"}`}>
                {quote ? dayBadge.text : "—"}
              </div>
            </div>
          </div>
        </div>

        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div>
        ) : null}

        {/* Chart */}
        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Performance</div>
            <div className="text-xs text-[#6B7A74]">
              {loading ? "Loading…" : closeVals.length ? `${closeVals.length} points` : "No data"}
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-2">
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Price line chart">
              <polyline
                fill="none"
                stroke="#22C55E"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={poly || ""}
              />
            </svg>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-[#6B7A74]">
            <span>{chart[0]?.t ?? ""}</span>
            <span>{chart[chart.length - 1]?.t ?? ""}</span>
          </div>
        </div>

        {/* News */}
        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold">Latest news</div>

          {loading ? (
            <div className="mt-3 text-sm text-[#6B7A74]">Loading…</div>
          ) : news.length ? (
            <div className="mt-3 space-y-3">
              {news.slice(0, 10).map((n, i) => (
                <a
                  key={`${n.url}-${i}`}
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-[#E6EEE9] bg-[#F7FAF8] p-4 hover:shadow-sm"
                >
                  <div className="text-sm font-semibold">{n.headline}</div>
                  <div className="mt-1 text-xs text-[#6B7A74]">
                    {n.source ? n.source : "News"}{" "}
                    {n.datetime ? `• ${new Date(n.datetime * 1000).toLocaleString()}` : ""}
                  </div>
                  {n.summary ? <div className="mt-2 text-sm text-[#4B5B55]">{n.summary}</div> : null}
                </a>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-sm text-[#6B7A74]">No recent news found.</div>
          )}
        </div>
      </div>
    </main>
  );
}