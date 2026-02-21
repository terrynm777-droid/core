// app/u/[username]/ui/PublicPortfolioCard.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type HoldingRow = {
  id: string;
  symbol: string;
  amount: number;
  currency: string | null;
};

type PublicSnapPoint = { day: string; total_usd: number };

type LivePosition = {
  symbol: string;
  currency: string;
  shares: number;
  prevClose: number;
  current: number;
  prevUsd: number;
  nowUsd: number;
  dayChangeUsd: number;
};

type PublicLiveValue = {
  totalUsd: number;
  dayChangePct: number;
  dayChangeAmount: number;
  positions: LivePosition[];
};

const PALETTE = ["#22C55E", "#0B0F0E", "#6B7A74", "#9CA3AF", "#16A34A", "#334155", "#94A3B8"];

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function clampIdx(i: number, n: number) {
  if (n <= 0) return 0;
  return Math.max(0, Math.min(n - 1, i));
}

function fmtMoney(x: number) {
  const n = Number(x);
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(x: number) {
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function shortDay(day: string) {
  if (!day || day.length < 10) return day;
  return `${day.slice(5, 7)}/${day.slice(8, 10)}`;
}

function normalizeToPct(series: number[]) {
  const firstIdx = series.findIndex((v) => Number.isFinite(v) && v > 0);
  if (firstIdx < 0) return series.map((v) => (Number.isFinite(v) ? 0 : NaN));
  const base = series[firstIdx];
  if (!Number.isFinite(base) || base <= 0) return series.map((v) => (Number.isFinite(v) ? 0 : NaN));
  return series.map((v) => {
    if (!Number.isFinite(v)) return NaN;
    return ((Number(v) - base) / base) * 100;
  });
}

function dayOverDayPct(series: number[], i: number) {
  if (i <= 0) return NaN;
  const prev = Number(series[i - 1]);
  const cur = Number(series[i]);
  if (!Number.isFinite(prev) || !Number.isFinite(cur) || prev <= 0) return NaN;
  return ((cur - prev) / prev) * 100;
}

function buildConicGradient(items: { label: string; value: number; color: string }[]) {
  const total = items.reduce((a, x) => a + x.value, 0);
  if (!total) return { gradient: "conic-gradient(#E6EEE9 0 100%)", rows: [] as any[], total: 0 };

  let acc = 0;
  const stops: string[] = [];

  const rows = items
    .filter((x) => x.value > 0)
    .map((x) => {
      const pct = (x.value / total) * 100;
      const from = acc;
      const to = acc + pct;
      acc = to;
      stops.push(`${x.color} ${from.toFixed(3)}% ${to.toFixed(3)}%`);
      return { ...x, pct };
    });

  return { gradient: `conic-gradient(${stops.join(", ")})`, rows, total };
}

async function fetchJsonOrThrow(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}
  if (!res.ok) {
    const rawMsg = json?.error || text || res.statusText || "Request failed";
    const msg = String(rawMsg).replace(/^\s*\d+\s*/, "").trim();
    throw new Error(`${res.status} ${msg}`.trim());
  }
  return json;
}

function safeNum(x: any, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function safeStr(x: any, fallback = "") {
  const s = String(x ?? "").trim();
  return s ? s : fallback;
}

// stable color per symbol
function hashColor(symbol: string) {
  let h = 2166136261;
  for (let i = 0; i < symbol.length; i++) {
    h ^= symbol.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Math.abs(h) % PALETTE.length;
  return PALETTE[idx];
}

export default function PublicPortfolioCard(props: {
  username: string;
  portfolioName: string;
  holdings: HoldingRow[];
}) {
  const { username, portfolioName, holdings } = props;

  const [live, setLive] = useState<PublicLiveValue | null>(null);
  const [snapPoints, setSnapPoints] = useState<PublicSnapPoint[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const todayDay = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    let alive = true;

    async function load() {
      setErr(null);

      try {
        const liveJson = await fetchJsonOrThrow(`/api/public/portfolio/value?username=${encodeURIComponent(username)}`);

        const positions: LivePosition[] = Array.isArray(liveJson?.positions)
          ? liveJson.positions.map((p: any): LivePosition => ({
              symbol: safeStr(p?.symbol).toUpperCase(),
              currency: safeStr(p?.currency, "USD").toUpperCase(),
              shares: safeNum(p?.shares, 0),
              prevClose: safeNum(p?.prevClose, 0),
              current: safeNum(p?.current, 0),
              prevUsd: safeNum(p?.prevUsd, 0),
              nowUsd: safeNum(p?.nowUsd, 0),
              dayChangeUsd: safeNum(p?.dayChangeUsd, 0),
            }))
          : [];

        const nextLive: PublicLiveValue = {
          totalUsd: safeNum(liveJson?.totalUsd, NaN),
          dayChangePct: safeNum(liveJson?.dayChangePct, NaN),
          dayChangeAmount: safeNum(liveJson?.dayChangeAmount, NaN),
          positions,
        };

        // snapshots are ONLY for chart history
        const snapJson = await fetchJsonOrThrow(
          `/api/public/portfolio/snapshot?username=${encodeURIComponent(username)}`
        );
        const pts = Array.isArray(snapJson?.points) ? snapJson.points : [];
        const nextSnaps = pts.map((p: any) => ({
          day: String(p.day),
          total_usd: safeNum(p.total_usd, NaN),
        }));

        if (!alive) return;
        setLive(nextLive);
        setSnapPoints(nextSnaps);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load public portfolio data");
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [username]);

  // Build series:
  // - sort asc
  // - ensure today exists
  // - force today == live.totalUsd (so header & chart match)
  const { seriesDays, seriesRaw } = useMemo(() => {
    const pts = [...snapPoints]
      .filter((p) => p.day && p.day.length >= 10)
      .sort((a, b) => a.day.localeCompare(b.day));

    const days = pts.map((p) => p.day);
    const raw = pts.map((p) => Number(p.total_usd));

    const liveTotal = live && Number.isFinite(live.totalUsd) ? Number(live.totalUsd) : NaN;

    if (days.length === 0) {
      return { seriesDays: [todayDay], seriesRaw: [Number.isFinite(liveTotal) ? liveTotal : NaN] };
    }

    const lastDay = days[days.length - 1];
    if (lastDay === todayDay) {
      if (Number.isFinite(liveTotal)) raw[raw.length - 1] = liveTotal;
    } else if (todayDay > lastDay) {
      days.push(todayDay);
      raw.push(Number.isFinite(liveTotal) ? liveTotal : NaN);
    } else {
      if (Number.isFinite(liveTotal)) raw[raw.length - 1] = liveTotal;
    }

    return { seriesDays: days, seriesRaw: raw };
  }, [snapPoints, live, todayDay]);

  const seriesPct = useMemo(() => normalizeToPct(seriesRaw), [seriesRaw]);

  // PIE SHOULD BE USD ALLOCATION, NOT SHARES
  const pieItems = useMemo(() => {
    const ps = (live?.positions ?? []).filter((p) => p.nowUsd > 0);
    if (!ps.length) return [];
    return ps
      .slice()
      .sort((a, b) => b.nowUsd - a.nowUsd)
      .map((p) => ({
        label: p.symbol,
        value: p.nowUsd,
        color: hashColor(p.symbol),
      }));
  }, [live]);

  const { gradient, rows: pieRows, total: pieTotal } = useMemo(() => buildConicGradient(pieItems), [pieItems]);

  return (
    <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold">{portfolioName}</div>
          <div className="text-xs text-[#6B7A74]">Public</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-[#6B7A74]">Total (USD)</div>
          <div className="text-sm font-semibold">
            {live && Number.isFinite(live.totalUsd) ? `$${fmtMoney(live.totalUsd)}` : "—"}
          </div>
          <div className="text-xs text-[#6B7A74]">
            Today{" "}
            <span className={live && Number(live.dayChangePct) >= 0 ? "text-green-600" : "text-red-600"}>
              {live && Number.isFinite(live.dayChangePct) ? fmtPct(live.dayChangePct) : "—"}
            </span>
            {live && Number.isFinite(live.dayChangeAmount) ? (
              <span className="ml-2 text-[#6B7A74]">({fmtMoney(live.dayChangeAmount)})</span>
            ) : null}
          </div>
        </div>
      </div>

      {err ? <div className="text-sm text-red-700">{err}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Pie */}
        <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Allocation</div>
            <div className="text-xs text-[#6B7A74]">
              {pieRows.length ? `${pieRows.length} positions • $${fmtMoney(pieTotal)}` : ""}
            </div>
          </div>

          <div className="mt-3 flex items-start gap-4">
            <div
              className="h-28 w-28 rounded-full border border-[#D7E4DD] bg-white"
              style={{ backgroundImage: gradient }}
              aria-label="Portfolio allocation pie"
            />
            <div className="flex-1 space-y-2">
              {pieRows.length ? (
                pieRows.slice(0, 6).map((r: any) => (
                  <div key={r.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="font-medium">{r.label}</span>
                    </div>
                    <span className="text-[#6B7A74]">{clamp(r.pct, 0, 100).toFixed(1)}%</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#6B7A74]">No positions yet.</div>
              )}
              {pieRows.length > 6 ? (
                <div className="text-[11px] text-[#6B7A74]">+ {pieRows.length - 6} more</div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Performance</div>
            <div className="text-xs text-[#6B7A74]">Line</div>
          </div>

          <div className="mt-3">
            {seriesDays.length === 0 ? (
              <div className="text-xs text-[#6B7A74]">No history yet.</div>
            ) : (
              <ChartSvg days={seriesDays} portfolioRaw={seriesRaw} portfolioY={seriesPct} live={live} />
            )}
          </div>
        </div>
      </div>

      {/* Holdings table (still shows stored holdings list) */}
      {holdings.length ? (
        <div className="overflow-hidden rounded-2xl border border-[#D7E4DD]">
          <div className="grid grid-cols-3 bg-[#F7FAF8] px-4 py-2 text-xs font-semibold text-[#4B5B55]">
            <div>Symbol</div>
            <div className="text-right">Shares</div>
            <div className="text-right">Currency</div>
          </div>

          <div className="divide-y divide-[#E6EEE9]">
            {holdings.map((h) => (
              <div key={h.id} className="grid grid-cols-3 px-4 py-2 text-sm">
                <div className="font-medium">{String(h.symbol || "").toUpperCase()}</div>
                <div className="text-right">{Number(h.amount || 0).toLocaleString()}</div>
                <div className="text-right text-[#6B7A74]">{h.currency || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-[#6B7A74]">No holdings yet.</div>
      )}
    </div>
  );
}

function ChartSvg(props: { days: string[]; portfolioRaw: number[]; portfolioY: number[]; live: PublicLiveValue | null }) {
  const W = 720;
  const H = 260;
  const PAD_L = 14;
  const PAD_R = 54;
  const PAD_T = 12;
  const PAD_B = 38;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const n = Math.max(props.days.length, 1);

  const xAt = (i: number) => {
    if (n <= 1) return PAD_L;
    return PAD_L + (i / (n - 1)) * (W - PAD_L - PAD_R);
  };

  const allVals = useMemo(() => {
    const all = props.portfolioY.flat().filter((v) => Number.isFinite(v));
    return all.length ? all : [0, 1];
  }, [props.portfolioY]);

  const minY = Math.min(...allVals);
  const maxY = Math.max(...allVals);
  const span = maxY - minY || 1;

  const yAt = (v: number) => {
    const vv = Number.isFinite(v) ? Number(v) : 0;
    return PAD_T + (1 - (vv - minY) / span) * (H - PAD_T - PAD_B);
  };

  const niceTicks = (min: number, max: number, count: number) => {
    const sp = max - min || 1;
    const rawStep = sp / Math.max(1, count - 1);
    const pow = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const steps = [1, 2, 5, 10].map((m) => m * pow);
    const step = steps.reduce((best, s) => (Math.abs(s - rawStep) < Math.abs(best - rawStep) ? s : best), steps[0]);
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const out: number[] = [];
    for (let v = start; v <= end + 1e-9; v += step) out.push(v);
    return out;
  };

  const yTicks = useMemo(() => niceTicks(minY, maxY, 5), [minY, maxY]);

  const xTickIdxs = useMemo(() => {
    const len = props.days.length;
    if (len <= 1) return [0];
    const target = 4;
    const step = Math.max(1, Math.floor((len - 1) / (target - 1)));
    const idxs: number[] = [];
    for (let i = 0; i < len; i += step) idxs.push(i);
    if (idxs[idxs.length - 1] !== len - 1) idxs.push(len - 1);
    return idxs;
  }, [props.days.length]);

  const pathFor = (y: number[]) => {
    if (!y.length) return "";
    let d = "";
    let started = false;

    for (let i = 0; i < y.length; i++) {
      const v = y[i];
      if (!Number.isFinite(v)) {
        started = false;
        continue;
      }
      const x = xAt(i);
      const yy = yAt(v);
      if (!started) {
        d += `M ${x} ${yy}`;
        started = true;
      } else {
        d += ` L ${x} ${yy}`;
      }
    }
    return d;
  };

  const hoverDay = useMemo(() => {
    if (hoverIdx == null) return "";
    return props.days[clampIdx(hoverIdx, props.days.length)] ?? "";
  }, [hoverIdx, props.days]);

  const hoverRaw = hoverIdx != null ? props.portfolioRaw[clampIdx(hoverIdx, props.portfolioRaw.length)] : NaN;
  const hoverY = hoverIdx != null ? props.portfolioY[clampIdx(hoverIdx, props.portfolioY.length)] : NaN;

  // KEY FIX: last point uses authoritative live.dayChangePct
  const hoverDodPct = useMemo(() => {
    if (hoverIdx == null) return NaN;
    const idx = clampIdx(hoverIdx, props.portfolioRaw.length);
    const isLast = idx === props.portfolioRaw.length - 1;

    if (isLast && props.live && Number.isFinite(Number(props.live.dayChangePct))) {
      return Number(props.live.dayChangePct);
    }
    return dayOverDayPct(props.portfolioRaw, idx);
  }, [hoverIdx, props.portfolioRaw, props.live]);

  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const plotW = r.width;
    if (plotW <= 0) return;
    const t = (x / plotW) * (n - 1);
    const idx = clampIdx(Math.round(t), n);
    setHoverIdx(idx);
  };

  return (
    <div ref={wrapRef} className="relative" onMouseMove={onMove} onMouseLeave={() => setHoverIdx(null)}>
      {hoverIdx != null ? (
        <div className="pointer-events-none absolute left-3 top-2 rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-xs shadow-sm">
          <div className="font-medium">{hoverDay}</div>
          <div className="text-[#6B7A74]">
            Day: <span className="font-medium">{fmtPct(hoverDodPct)}</span>
          </div>
          <div className="text-[#6B7A74]">
            Series: <span className="font-medium">{fmtPct(hoverY)}</span>
          </div>
          <div className="text-[#6B7A74]">Total: ${fmtMoney(hoverRaw)}</div>
        </div>
      ) : null}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-64 select-none">
        {yTicks.map((v, i) => {
          const y = yAt(v);
          return (
            <g key={`yt-${i}`}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#D7E4DD" strokeWidth="1" />
              <text x={W - PAD_R + 6} y={y + 3} fontSize="10" fill="#6B7A74">
                {fmtPct(v)}
              </text>
            </g>
          );
        })}

        {xTickIdxs.map((i) => {
          const x = xAt(i);
          const label = shortDay(props.days[clampIdx(i, props.days.length)] || "");
          return (
            <g key={`xt-${i}`}>
              <line x1={x} y1={H - PAD_B} x2={x} y2={H - PAD_B + 4} stroke="#D7E4DD" strokeWidth="1" />
              <text x={x} y={H - 10} fontSize="10" fill="#6B7A74" textAnchor="middle">
                {label}
              </text>
            </g>
          );
        })}

        <path d={pathFor(props.portfolioY)} fill="none" stroke="#0B0F0E" strokeWidth="2" />

        {hoverIdx != null ? (
          <line x1={xAt(hoverIdx)} y1={PAD_T} x2={xAt(hoverIdx)} y2={H - PAD_B} stroke="#9CA3AF" strokeWidth="1" />
        ) : null}
      </svg>
    </div>
  );
}