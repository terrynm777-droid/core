// app/settings/portfolio/ui/PortfolioEditor.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * DAILY % RULE (DO NOT TOUCH):
 * /api/portfolio/value MUST return:
 * {
 *   totalUsd: number,
 *   dayChangePct: number,
 *   dayChangeAmount: number,
 *   positions: Array<{
 *     symbol: string,
 *     currency: string,
 *     shares: number,
 *     prevClose: number,
 *     current: number,
 *     prevUsd: number,
 *     nowUsd: number,
 *     dayChangeUsd: number
 *   }>
 * }
 *
 * This UI DOES NOT recompute daily % locally.
 * It displays dayChangePct/dayChangeAmount returned by the API.
 *
 * HOLDINGS INPUT RULE (FIX FOR "4 MILLION" BUG):
 * - User enters INVESTED AMOUNT + BUY PRICE (both in the holding's currency)
 * - We compute shares = invested / buyPrice
 * - We still save "amount" as SHARES (to keep existing /api/portfolio/value logic working)
 * - We also save buy_price so we can show what they bought at
 */

type SymbolResult = { symbol: string; name: string; type: string };

type Holding = {
  symbol: string;
  name?: string;
  amount: number; // SHARES (computed from invested/buyPrice)
  currency: string; // trade currency
  buy_price?: number | null; // per-share buy price in trade currency
};

type SnapPoint = { day: string; total_usd: number };

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

type LiveValue = {
  totalUsd: number;
  dayChangePct: number;
  dayChangeAmount: number;
  positions: LivePosition[];
};

const CURRENCIES = ["USD", "JPY", "AUD", "HKD", "EUR", "GBP", "CNY", "CAD", "CHF", "SGD"];
const PALETTE = ["#22C55E", "#0B0F0E", "#6B7A74", "#9CA3AF", "#16A34A", "#334155"];

function clampNonNeg(n: number) {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
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

async function fetchJsonOrThrow(res: Response) {
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

function sortAsc(points: SnapPoint[]) {
  return [...points]
    .filter((p) => p.day && p.day.length >= 10)
    .sort((a, b) => a.day.localeCompare(b.day));
}

function normalizeToPct(series: number[]) {
  // Day-over-day % change series (what users expect for "% Change")
  return series.map((v, i) => {
    if (!Number.isFinite(v)) return NaN;
    if (i === 0) return 0;
    return dayOverDayPct(series, i);
  });
}

function dayOverDayPct(series: number[], i: number) {
  if (i <= 0) return NaN;
  const prev = Number(series[i - 1]);
  const cur = Number(series[i]);
  if (!Number.isFinite(prev) || !Number.isFinite(cur) || prev <= 0) return NaN;
  return ((cur - prev) / prev) * 100;
}

function buildConicGradient(items: { color: string; value: number }[], total: number) {
  if (total <= 0 || items.length === 0) {
    return { backgroundImage: "conic-gradient(#D7E4DD 0 100%)" } as any;
  }
  let acc = 0;
  const segs: string[] = [];
  for (const it of items) {
    const w = (it.value / total) * 100;
    const start = acc;
    const end = acc + w;
    acc = end;
    segs.push(`${it.color} ${start}% ${end}%`);
  }
  return { backgroundImage: `conic-gradient(${segs.join(",")})` } as any;
}

export default function PortfolioEditor() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("My Portfolio");
  const [isPublic, setIsPublic] = useState(false);

  // Stored holdings are for editing/saving only
  const [holdings, setHoldings] = useState<Holding[]>([]);

  // add holding flow
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SymbolResult[]>([]);
  const [pick, setPick] = useState<SymbolResult | null>(null);

  // NEW INPUTS:
  const [invested, setInvested] = useState<string>(""); // invested amount in trade currency
  const [buyPrice, setBuyPrice] = useState<string>(""); // buy price per share in trade currency

  const [currency, setCurrency] = useState("USD");

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // live value (authoritative daily %)
  const [live, setLive] = useState<LiveValue | null>(null);

  // snapshots for performance chart
  const [snapPoints, setSnapPoints] = useState<SnapPoint[]>([]);

  // chart controls
  const [resolution, setResolution] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "ALL">("1M");
  const [normalizeMode, setNormalizeMode] = useState<"pct" | "price">("pct");

  const todayDay = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function refreshLive() {
    const res = await fetch("/api/portfolio/value", { cache: "no-store" });
    const json = await fetchJsonOrThrow(res);

    const positions: LivePosition[] = Array.isArray(json?.positions)
      ? json.positions.map((p: any): LivePosition => ({
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

    setLive({
      totalUsd: safeNum(json?.totalUsd, 0),
      dayChangePct: safeNum(json?.dayChangePct, 0),
      dayChangeAmount: safeNum(json?.dayChangeAmount, 0),
      positions,
    });
  }

  async function refreshSnapshots() {
    const res = await fetch("/api/portfolio/snapshot", { cache: "no-store" });
    const json = await fetchJsonOrThrow(res);

    const pts = Array.isArray(json?.points) ? json.points : [];
    setSnapPoints(
      pts.map((p: any): SnapPoint => ({
        day: String(p.day),
        total_usd: safeNum(p.total_usd, NaN),
      }))
    );
  }

  async function load() {
    setErr(null);
    setOk(null);
    setLoading(true);

    try {
      const res = await fetch("/api/portfolio", { cache: "no-store" });
      const json = await fetchJsonOrThrow(res);

      setName(json?.portfolio?.name ?? "My Portfolio");
      setIsPublic(Boolean(json?.portfolio?.is_public));

      const rows = Array.isArray(json?.holdings) ? json.holdings : [];
      const nextHoldings: Holding[] = rows
        .map((r: any): Holding => ({
          symbol: safeStr(r.symbol).toUpperCase(),
          amount: safeNum(r.amount, 0), // shares
          currency: safeStr(r.currency, "USD").toUpperCase(),
          buy_price: Number.isFinite(Number(r.buy_price)) ? Number(r.buy_price) : null,
        }))
        .filter((h: Holding) => Boolean(h.symbol) && Number.isFinite(h.amount) && h.amount > 0);

      setHoldings(nextHoldings);

      await refreshLive();
      await refreshSnapshots();
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function searchSymbols(text: string) {
    const t = text.trim();
    setQ(text);
    setPick(null);
    if (t.length < 1) {
      setResults([]);
      return;
    }
    const res = await fetch(`/api/symbols?q=${encodeURIComponent(t)}`, { cache: "no-store" });
    const json = await fetchJsonOrThrow(res);
    setResults(Array.isArray(json?.results) ? json.results : []);
  }

  function addHolding() {
    setErr(null);
    setOk(null);

    if (!pick?.symbol) {
      setErr("Pick a stock/crypto from the search results.");
      return;
    }

    const inv = clampNonNeg(Number(invested));
    if (inv <= 0) {
      setErr("Enter a valid invested amount.");
      return;
    }

    const bp = clampNonNeg(Number(buyPrice));
    if (bp <= 0) {
      setErr("Enter a valid buy price.");
      return;
    }

    const shares = inv / bp;
    if (!Number.isFinite(shares) || shares <= 0) {
      setErr("Invested / buy price produced invalid shares.");
      return;
    }

    const sym = pick.symbol.toUpperCase();
    const cur = currency.toUpperCase();

    setHoldings((prev) => {
      // Merge if same symbol+currency+buy_price (optional). If you want strict per-lot tracking, remove merging.
      const idx = prev.findIndex(
        (h) => h.symbol === sym && h.currency === cur && Number(h.buy_price ?? 0) === Number(bp)
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], amount: copy[idx].amount + shares };
        return copy;
      }
      return [...prev, { symbol: sym, name: pick.name, amount: shares, currency: cur, buy_price: bp }];
    });

    setPick(null);
    setResults([]);
    setQ("");
    setInvested("");
    setBuyPrice("");
  }

  function removeHolding(i: number) {
    setHoldings((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function saveAll() {
    setErr(null);
    setOk(null);
    setSaving(true);

    try {
      const metaRes = await fetch("/api/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, is_public: isPublic }),
      });
      await fetchJsonOrThrow(metaRes);

      // NOTE: backend must accept buy_price or ignore it safely.
      const putRes = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings }),
      });
      await fetchJsonOrThrow(putRes);

      // create one snapshot after saving
      await fetch("/api/portfolio/snapshot", { method: "POST" }).catch(() => {});

      setOk("Saved.");
      await refreshLive();
      await refreshSnapshots();
      router.push("/feed");
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // LIVE positions drive pie + totals (not stored holdings)
  const livePositions = useMemo(() => (live?.positions ?? []).filter((p) => p.nowUsd > 0), [live]);
  const totalAmountUsd = useMemo(() => safeNum(live?.totalUsd, 0), [live]);

  const pieStyle = useMemo(() => {
    const items = livePositions.map((p, i) => ({ color: PALETTE[i % PALETTE.length], value: p.nowUsd }));
    return buildConicGradient(items, totalAmountUsd);
  }, [livePositions, totalAmountUsd]);

  const pieLegend = useMemo(() => {
    if (totalAmountUsd <= 0 || livePositions.length === 0) return [];
    return livePositions.map((p, i) => {
      const pct = (p.nowUsd / totalAmountUsd) * 100;
      return {
        key: `${p.symbol}-${p.currency}-${i}`,
        color: PALETTE[i % PALETTE.length],
        label: `${p.symbol} (${p.currency})`,
        pct,
        shares: p.shares,
        usdValue: p.nowUsd,
      };
    });
  }, [livePositions, totalAmountUsd]);

  // snapshot view filtering
  const viewSnapPoints = useMemo(() => {
    if (!snapPoints.length) return [];
    if (resolution === "ALL") return sortAsc(snapPoints);

    const now = new Date();
    const daysBack =
      resolution === "1D"
        ? 5
        : resolution === "1W"
          ? 28
          : resolution === "1M"
            ? 90
            : resolution === "3M"
              ? 180
              : resolution === "1Y"
                ? 365
                : 3650;

    const cutoff = new Date(now.getTime() - daysBack * 86400_000);

    return sortAsc(
      snapPoints.filter((p) => {
        const d = new Date(p.day + "T00:00:00Z");
        return d >= cutoff;
      })
    );
  }, [snapPoints, resolution]);

  // chart series: force last point to equal live.totalUsd so chart matches header total
  const { seriesDays, seriesRaw } = useMemo(() => {
    const pts = viewSnapPoints;
    const days = pts.map((p) => p.day);
    const raw = pts.map((p) => safeNum(p.total_usd, NaN));

    const liveTotal = totalAmountUsd;

    if (!days.length) return { seriesDays: [todayDay], seriesRaw: [liveTotal] };

    const lastDay = days[days.length - 1];

    if (lastDay === todayDay) {
      raw[raw.length - 1] = liveTotal;
    } else if (todayDay > lastDay) {
      days.push(todayDay);
      raw.push(liveTotal);
    } else {
      raw[raw.length - 1] = liveTotal;
    }

    return { seriesDays: days, seriesRaw: raw };
  }, [viewSnapPoints, todayDay, totalAmountUsd]);

  const seriesPct = useMemo(() => normalizeToPct(seriesRaw), [seriesRaw]);
  const seriesY = normalizeMode === "pct" ? seriesPct : seriesRaw;

  if (loading) return <div className="text-sm text-[#6B7A74]">Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Pie + live change */}
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 rounded-full border border-[#D7E4DD]" style={pieStyle} />
        <div className="flex-1">
          <div className="text-sm font-semibold">Portfolio</div>
          <div className="text-sm text-[#6B7A74]">Total allocation: ${fmtMoney(totalAmountUsd)}</div>
          {live ? (
            <div className="mt-1 text-sm">
              Today:{" "}
              <span className={Number(live.dayChangePct) >= 0 ? "text-green-600" : "text-red-600"}>
                {Number.isFinite(Number(live.dayChangePct)) ? Number(live.dayChangePct).toFixed(2) : "—"}% (
                {Number.isFinite(Number(live.dayChangeAmount)) ? Number(live.dayChangeAmount).toFixed(2) : "—"})
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Legend */}
      {pieLegend.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {pieLegend.map((it) => (
            <div key={it.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: it.color }} />
                <span className="font-mono">{it.label}</span>
              </div>
              <div className="text-[#6B7A74]">
                {it.pct.toFixed(1)}% • {it.shares.toLocaleString()} • ${fmtMoney(it.usdValue)}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Performance */}
      <div className="rounded-2xl border border-[#D7E4DD] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Performance</div>
          <div className="text-xs text-[#6B7A74]">Line</div>
        </div>

        <div className="mt-3 grid grid-cols-12 gap-2">
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as any)}
            className="col-span-4 rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          >
            <option value="1D">1D</option>
            <option value="1W">1W</option>
            <option value="1M">1M</option>
            <option value="3M">3M</option>
            <option value="1Y">1Y</option>
            <option value="ALL">ALL</option>
          </select>

          <select
            value={normalizeMode}
            onChange={(e) => setNormalizeMode(e.target.value as any)}
            className="col-span-4 rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          >
            <option value="pct">% Change</option>
            <option value="price">Price</option>
          </select>

          <button
            type="button"
            onClick={async () => {
              try {
                setErr(null);
                await refreshLive();
                await refreshSnapshots();
              } catch (e: any) {
                setErr(e?.message || "Refresh failed");
              }
            }}
            className="col-span-4 rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm hover:shadow-sm"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 relative z-0">
          {seriesDays.length === 0 ? (
            <div className="text-xs text-[#6B7A74]">No history yet.</div>
          ) : (
            <ChartSvg
              days={seriesDays}
              portfolioRaw={seriesRaw}
              portfolioY={seriesY}
              normalizeMode={normalizeMode}
              live={live}
            />
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="space-y-2">
        <div className="text-sm font-semibold">Portfolio name</div>
        <input
          className="w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Public portfolio</div>
          <div className="text-xs text-[#6B7A74]">{isPublic ? "Anyone with the link can view it." : "Only you can view it."}</div>
        </div>
        <button
          type="button"
          onClick={() => setIsPublic((v) => !v)}
          className={`rounded-2xl px-4 py-2 text-sm font-medium ${
            isPublic ? "bg-[#22C55E] text-white" : "border border-[#D7E4DD] bg-white"
          }`}
        >
          {isPublic ? "Public" : "Private"}
        </button>
      </div>

      {/* Add holding */}
      <div className="rounded-2xl border border-[#D7E4DD] bg-white p-4 space-y-3">
        <div className="text-sm font-semibold">Add holding</div>

        <input
          value={q}
          onChange={(e) => searchSymbols(e.target.value)}
          placeholder="Search stock / crypto (e.g., NVDA, BTC)"
          className="w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
        />

        {results.length > 0 ? (
          <div className="max-h-48 overflow-auto rounded-xl border border-[#D7E4DD]">
            {results.map((r) => (
              <button
                key={`${r.symbol}-${r.type}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPick(r);
                  setResults([]);
                  setQ(`${r.symbol} — ${r.name}`);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#F7FAF8]"
              >
                <span className="font-mono">{r.symbol}</span> <span className="text-[#6B7A74]">— {r.name}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-12 gap-2">
          <input
            value={invested}
            onChange={(e) => setInvested(e.target.value)}
            placeholder="Invested amount"
            inputMode="decimal"
            className="col-span-5 rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          />
          <input
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            placeholder="Buy price"
            inputMode="decimal"
            className="col-span-4 rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="col-span-2 rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addHolding}
            className="col-span-1 rounded-xl bg-[#22C55E] text-white text-sm font-medium hover:brightness-95"
            title="Add"
          >
            +
          </button>
        </div>

        <div className="text-xs text-[#6B7A74]">
          You enter invested amount + buy price. We compute shares automatically. Daily % still comes from API (prev close vs current).
        </div>
      </div>

      {/* Holdings list */}
      <div className="space-y-2">
        <div className="text-sm font-semibold">Holdings</div>
        {holdings.length === 0 ? (
          <div className="text-sm text-[#6B7A74]">No holdings yet.</div>
        ) : (
          holdings.map((h, i) => {
            const bp = Number(h.buy_price ?? 0);
            const investedApprox = bp > 0 ? h.amount * bp : 0;
            return (
              <div
                key={`${h.symbol}-${h.currency}-${i}`}
                className="flex items-center justify-between rounded-2xl border border-[#D7E4DD] bg-white p-3"
              >
                <div>
                  <div className="text-sm font-medium">
                    <span className="font-mono">{h.symbol}</span> <span className="text-[#6B7A74]">({h.currency})</span>
                  </div>
                  <div className="text-xs text-[#6B7A74]">
                    Shares: {h.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}{" "}
                    {bp > 0 ? `• Buy: ${fmtMoney(bp)} • Invested: ${fmtMoney(investedApprox)}` : "• Buy: —"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeHolding(i)}
                  className="rounded-xl border border-[#D7E4DD] bg-white px-3 py-1 text-sm hover:shadow-sm"
                >
                  Remove
                </button>
              </div>
            );
          })
        )}
      </div>

      {err ? <div className="text-sm text-red-600">{err}</div> : null}
      {ok ? <div className="text-sm text-green-600">{ok}</div> : null}

      <button
        onClick={saveAll}
        disabled={saving}
        className="w-full rounded-2xl bg-[#22C55E] px-4 py-3 text-white font-medium disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save portfolio"}
      </button>
    </div>
  );
}

function ChartSvg(props: {
  days: string[];
  portfolioRaw: number[];
  portfolioY: number[];
  normalizeMode: "pct" | "price";
  live: LiveValue | null;
}) {
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

  const rightLabel = (v: number) => (props.normalizeMode === "pct" ? fmtPct(v) : fmtMoney(v));

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

  // Tooltip day%:
  // - For the last point (today), show live.dayChangePct (authoritative).
  // - Otherwise compute day-over-day from snapshot series.
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
            {props.normalizeMode === "pct" ? `Series: ${fmtPct(hoverY)}` : `Value: $${fmtMoney(hoverY)}`}
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
                {rightLabel(v)}
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