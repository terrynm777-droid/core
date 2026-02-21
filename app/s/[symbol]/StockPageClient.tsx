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

type MaybeBlocked<T> = { blocked?: boolean; reason?: string } & T;

function fmt(n: number, digits = 2) {
  if (!isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function pct(n: number, digits = 2) {
  if (!isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function buildLinePoints(values: number[], w: number, h: number, pad = 10) {
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

function yFromValue(v: number, min: number, max: number, h: number, pad: number) {
  const span = max - min || 1;
  return pad + (1 - (v - min) / span) * (h - pad * 2);
}

function xAt(i: number, n: number, w: number, pad: number) {
  return pad + (i * (w - pad * 2)) / Math.max(n - 1, 1);
}

function shortDay(isoYmd: string) {
  // "2026-02-21" -> "Feb 21"
  if (!isoYmd || isoYmd.length < 10) return isoYmd || "";
  const d = new Date(isoYmd + "T00:00:00Z");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function StockPageClient({ symbol }: { symbol: string }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);

  // chart UI controls
  const [range, setRange] = useState<"7d" | "1m" | "3m" | "6m" | "1y">("7d");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  async function load(nextRange?: typeof range) {
    const r = nextRange ?? range;

    setErr(null);
    setWarn(null);
    setLoading(true);

    try {
      const [qRes, cRes, nRes] = await Promise.all([
        fetch(`/api/stocks/quote?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" }),
        fetch(`/api/stocks/chart?symbol=${encodeURIComponent(symbol)}&range=${encodeURIComponent(r)}`, {
          cache: "no-store",
        }),
        fetch(`/api/stocks/news?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" }),
      ]);

      const [qJson, cJson, nJson] = await Promise.all([
        qRes.json().catch(() => null),
        cRes.json().catch(() => null),
        nRes.json().catch(() => null),
      ]);

      // QUOTE (non-fatal if provider blocked)
      if (qRes.ok) {
        const payload = qJson as MaybeBlocked<{ quote?: Quote | null }>;
        setQuote(payload?.quote ?? null);
        if (payload?.blocked) setWarn(payload?.reason || "Quote unavailable (provider access/rate limit).");
      } else {
        setQuote(null);
        setWarn((prev) => prev ?? (qJson?.error || "Quote unavailable."));
      }

      // CHART (non-fatal)
      if (cRes.ok) {
        const payload = cJson as MaybeBlocked<{ points?: ChartPoint[] }>;
        setChart(Array.isArray(payload?.points) ? payload.points : []);
        if (payload?.blocked) setWarn((prev) => prev ?? (payload?.reason || "Chart unavailable (provider blocked)."));
      } else {
        setChart([]);
        setWarn((prev) => prev ?? (cJson?.error || "Chart unavailable."));
      }

      // NEWS (non-fatal)
      if (nRes.ok) {
        const payload = nJson as MaybeBlocked<{ items?: NewsItem[] }>;
        setNews(Array.isArray(payload?.items) ? payload.items : []);
        if (payload?.blocked) setWarn((prev) => prev ?? (payload?.reason || "News unavailable (provider blocked)."));
      } else {
        setNews([]);
        setWarn((prev) => prev ?? (nJson?.error || "News unavailable."));
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
      setHoverIdx(null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  // chart data
  const W = 720;
  const H = 220;
  const PAD = 14;

  const closeVals = useMemo(() => chart.map((p) => Number(p.c ?? 0)).filter((x) => isFinite(x)), [chart]);
  const dates = useMemo(() => chart.map((p) => String(p.t || "")).filter(Boolean), [chart]);

  const minV = useMemo(() => (closeVals.length ? Math.min(...closeVals) : 0), [closeVals]);
  const maxV = useMemo(() => (closeVals.length ? Math.max(...closeVals) : 0), [closeVals]);
  const poly = useMemo(() => buildLinePoints(closeVals, W, H, PAD), [closeVals]);

  // perf stats for range (first -> last)
  const first = closeVals[0] ?? NaN;
  const last = closeVals[closeVals.length - 1] ?? NaN;
  const absChange = isFinite(first) && isFinite(last) ? last - first : NaN;
  const relChange = isFinite(first) && first !== 0 ? (absChange / first) * 100 : NaN;

  // day-to-day (for 7d especially)
  const dailyMoves = useMemo(() => {
    const arr: { t: string; c: number; dAbs: number; dPct: number }[] = [];
    for (let i = 0; i < chart.length; i++) {
      const t = String(chart[i]?.t || "");
      const c = Number(chart[i]?.c ?? NaN);
      const prev = i > 0 ? Number(chart[i - 1]?.c ?? NaN) : NaN;
      const dAbs = isFinite(prev) && isFinite(c) ? c - prev : NaN;
      const dPct = isFinite(prev) && prev !== 0 && isFinite(c) ? (dAbs / prev) * 100 : NaN;
      arr.push({ t, c, dAbs, dPct });
    }
    return arr;
  }, [chart]);

  // hover display
  const hover = useMemo(() => {
    if (hoverIdx == null) return null;
    const i = clamp(hoverIdx, 0, chart.length - 1);
    const row = dailyMoves[i];
    if (!row) return null;
    return row;
  }, [hoverIdx, chart.length, dailyMoves]);

  // Y-axis ticks (min / mid / max)
  const yTicks = useMemo(() => {
    if (!closeVals.length) return [];
    const mid = (minV + maxV) / 2;
    return [maxV, mid, minV].map((v) => ({ v, y: yFromValue(v, minV, maxV, H, PAD) }));
  }, [closeVals.length, minV, maxV]);

  const xTicks = useMemo(() => {
    const n = dates.length;
    if (!n) return [];
    // show 4 labels max
    const idxs =
      n <= 4 ? [...Array(n)].map((_, i) => i) : [0, Math.floor((n - 1) / 3), Math.floor(((n - 1) * 2) / 3), n - 1];
    return idxs.map((i) => ({ i, x: xAt(i, n, W, PAD), label: shortDay(dates[i] || "") }));
  }, [dates]);

  const quoteBadge = useMemo(() => {
    const pctv = Number(quote?.changePct ?? 0);
    const down = pctv < 0;
    return { text: pct(pctv, 2), down };
  }, [quote]);

  function onSvgMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!chart.length) return;
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    const frac = clamp(px / rect.width, 0, 1);
    const i = Math.round(frac * (chart.length - 1));
    setHoverIdx(i);
  }

  function RangePill({ r, label }: { r: typeof range; label: string }) {
    const active = range === r;
    return (
      <button
        type="button"
        onClick={() => {
          setRange(r);
          load(r);
        }}
        className={[
          "rounded-2xl border px-3 py-1 text-xs font-medium",
          active
            ? "border-[#22C55E] bg-[#EAF9F0] text-[#14532D]"
            : "border-[#D7E4DD] bg-white hover:shadow-sm",
        ].join(" ")}
      >
        {label}
      </button>
    );
  }

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
            onClick={() => load()}
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
              <div className="mt-1 text-sm text-[#6B7A74]">Quote + {range.toUpperCase()} chart</div>
            </div>

            <div className="text-right">
              <div className="text-xs text-[#6B7A74]">Price</div>
              <div className="text-2xl font-semibold">{fmt(Number(quote?.current ?? NaN))}</div>
              <div className={`text-sm font-semibold ${quoteBadge.down ? "text-red-600" : "text-[#22C55E]"}`}>
                {quote ? quoteBadge.text : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Fatal error (unexpected) */}
        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div>
        ) : null}

        {/* Provider warning (non-fatal) */}
        {!err && warn ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{warn}</div>
        ) : null}

        {/* Chart */}
        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Performance</div>
              <div className="mt-1 text-xs text-[#6B7A74]">
                {loading ? "Loading…" : closeVals.length ? `${closeVals.length} points` : "No data"}
              </div>
            </div>

            {/* Range pills */}
            <div className="flex flex-wrap items-center gap-2">
              <RangePill r="7d" label="7D" />
              <RangePill r="1m" label="1M" />
              <RangePill r="3m" label="3M" />
              <RangePill r="6m" label="6M" />
              <RangePill r="1y" label="1Y" />
            </div>
          </div>

          {/* Stats row (broker-style minimum) */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#E6EEE9] bg-[#F7FAF8] p-4">
              <div className="text-[11px] text-[#6B7A74]">{range.toUpperCase()} change</div>
              <div className="mt-1 text-sm font-semibold">
                {isFinite(absChange) ? `${absChange >= 0 ? "+" : ""}${fmt(absChange)}` : "—"}
                <span className="ml-2 text-xs text-[#6B7A74]">{isFinite(relChange) ? `(${pct(relChange)})` : ""}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E6EEE9] bg-[#F7FAF8] p-4">
              <div className="text-[11px] text-[#6B7A74]">{range.toUpperCase()} low</div>
              <div className="mt-1 text-sm font-semibold">{closeVals.length ? fmt(minV) : "—"}</div>
            </div>

            <div className="rounded-2xl border border-[#E6EEE9] bg-[#F7FAF8] p-4">
              <div className="text-[11px] text-[#6B7A74]">{range.toUpperCase()} high</div>
              <div className="mt-1 text-sm font-semibold">{closeVals.length ? fmt(maxV) : "—"}</div>
            </div>
          </div>

          {/* Hover info */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7A74]">
            <div>
              {hover ? (
                <>
                  <span className="font-medium text-[#0B0F0E]">{shortDay(hover.t)}</span>
                  <span className="mx-2">•</span>
                  <span className="font-medium text-[#0B0F0E]">{fmt(hover.c)}</span>
                  <span className="mx-2">•</span>
                  <span className={isFinite(hover.dPct) && hover.dPct < 0 ? "text-red-600" : "text-[#22C55E]"}>
                    {isFinite(hover.dAbs) ? `${hover.dAbs >= 0 ? "+" : ""}${fmt(hover.dAbs)}` : "—"}{" "}
                    {isFinite(hover.dPct) ? `(${pct(hover.dPct)})` : ""}
                  </span>
                </>
              ) : closeVals.length ? (
                <>
                  <span>{shortDay(dates[0] || "")}</span>
                  <span className="mx-2">→</span>
                  <span>{shortDay(dates[dates.length - 1] || "")}</span>
                </>
              ) : (
                "—"
              )}
            </div>

            <div className="text-[11px]">Hover the chart for daily move</div>
          </div>

          {/* Plot */}
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-2">
            {closeVals.length ? (
              <svg
                width="100%"
                viewBox={`0 0 ${W} ${H}`}
                role="img"
                aria-label="Price line chart"
                onMouseMove={onSvgMove}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ touchAction: "none" }}
              >
                {/* grid + y labels */}
                {yTicks.map((t, idx) => (
                  <g key={idx}>
                    <line x1={PAD} y1={t.y} x2={W - PAD} y2={t.y} stroke="#E6EEE9" strokeWidth="2" />
                    <text x={PAD} y={t.y - 6} fontSize="11" fill="#6B7A74">
                      {fmt(t.v)}
                    </text>
                  </g>
                ))}

                {/* line */}
                <polyline
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={poly || ""}
                />

                {/* hover crosshair + dot */}
                {hoverIdx != null && (
                  <>
                    <line
                      x1={xAt(hoverIdx, closeVals.length, W, PAD)}
                      y1={PAD}
                      x2={xAt(hoverIdx, closeVals.length, W, PAD)}
                      y2={H - PAD}
                      stroke="#9CA3AF"
                      strokeWidth="2"
                    />
                    <circle
                      cx={xAt(hoverIdx, closeVals.length, W, PAD)}
                      cy={yFromValue(closeVals[hoverIdx] ?? minV, minV, maxV, H, PAD)}
                      r="5"
                      fill="#22C55E"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  </>
                )}

                {/* x labels */}
                {xTicks.map((t, idx) => (
                  <text key={idx} x={t.x} y={H - 2} fontSize="11" fill="#6B7A74" textAnchor="middle">
                    {t.label}
                  </text>
                ))}
              </svg>
            ) : (
              <div className="h-[220px]" />
            )}
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
                    {n.source ? n.source : "News"}
                    {n.datetime ? ` • ${new Date(n.datetime * 1000).toLocaleString()}` : ""}
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