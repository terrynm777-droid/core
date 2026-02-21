// FILE 2: app/settings/portfolio/ui/PortfolioEditor.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsdBaseRates } from "@/lib/fx";

type SymbolResult = { symbol: string; name: string; type: string };

type Holding = {
  symbol: string;
  name?: string;
  amount: number;
  currency: string;
};

type HoldingWithUsd = Holding & { usdAmount: number };
type SnapPoint = { day: string; total_usd: number };

type LiveValue = {
  totalUsd?: number;
  dayChangePct?: number;
  dayChangeAmount?: number;
};

const CURRENCIES = ["USD", "JPY", "AUD", "HKD", "EUR", "GBP", "CNY", "CAD", "CHF", "SGD"];
const PALETTE = ["#22C55E", "#0B0F0E", "#6B7A74", "#9CA3AF", "#16A34A", "#334155"];

function clampNonNeg(n: number) {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

// FX helper: returns USD per 1 unit of currency
function toUsdPerUnit(currency: string, raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const c = currency.toUpperCase();
  if (c === "USD") return 1;
  // crude heuristic: if quote looks like JPY-per-USD, invert it
  if (raw > 5) return 1 / raw;
  return raw;
}

function normalizeRates(fx: any): Record<string, number> {
  if (!fx) return { USD: 1 };
  if (fx.rates && typeof fx.rates === "object") return { USD: 1, ...fx.rates };
  if (typeof fx === "object") return { USD: 1, ...fx };
  return { USD: 1 };
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

function sortAsc(points: SnapPoint[]) {
  return [...points]
    .filter((p) => p.day && p.day.length >= 10)
    .sort((a, b) => a.day.localeCompare(b.day));
}

export default function PortfolioEditor() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("My Portfolio");
  const [isPublic, setIsPublic] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });

  // add holding flow
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SymbolResult[]>([]);
  const [pick, setPick] = useState<SymbolResult | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState("USD");

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // live + snapshots
  const [live, setLive] = useState<LiveValue | null>(null);
  const [snapPoints, setSnapPoints] = useState<SnapPoint[]>([]);

  // chart controls
  const [resolution, setResolution] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "ALL">("1M");
  const [normalizeMode, setNormalizeMode] = useState<"pct" | "price">("pct");

  const todayDay = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const holdingsWithUsd: HoldingWithUsd[] = useMemo(() => {
    return holdings.map((h) => {
      const raw = Number(rates[h.currency] ?? (h.currency === "USD" ? 1 : 0));
      const usdPerUnit = toUsdPerUnit(h.currency, raw);
      const usdAmount = usdPerUnit > 0 ? h.amount * usdPerUnit : 0;
      return { ...h, usdAmount };
    });
  }, [holdings, rates]);

  const totalAmountUsd = useMemo(
    () => holdingsWithUsd.reduce((a, h) => a + (h.usdAmount || 0), 0),
    [holdingsWithUsd]
  );

  const pieStyle = useMemo(() => {
    if (totalAmountUsd <= 0 || holdingsWithUsd.length === 0) {
      return { backgroundImage: "conic-gradient(#D7E4DD 0 100%)" } as any;
    }

    let acc = 0;
    const segs: string[] = [];
    holdingsWithUsd.forEach((h, i) => {
      const w = (h.usdAmount / totalAmountUsd) * 100;
      const start = acc;
      const end = acc + w;
      acc = end;
      segs.push(`${PALETTE[i % PALETTE.length]} ${start}% ${end}%`);
    });

    return { backgroundImage: `conic-gradient(${segs.join(",")})` } as any;
  }, [holdingsWithUsd, totalAmountUsd]);

  const pieLegend = useMemo(() => {
    if (totalAmountUsd <= 0 || holdingsWithUsd.length === 0) return [];
    return holdingsWithUsd.map((h, i) => {
      const pct = (h.usdAmount / totalAmountUsd) * 100;
      return {
        key: `${h.symbol}-${h.currency}-${i}`,
        color: PALETTE[i % PALETTE.length],
        label: `${h.symbol} (${h.currency})`,
        pct,
        amount: h.amount,
      };
    });
  }, [holdingsWithUsd, totalAmountUsd]);

  async function refreshLive() {
    const res = await fetch("/api/portfolio/value", { cache: "no-store" });
    const json = await fetchJsonOrThrow(res);
    setLive({
      totalUsd: Number(json?.totalUsd ?? json?.total_usd ?? NaN),
      dayChangePct: Number(json?.dayChangePct ?? NaN),
      dayChangeAmount: Number(json?.dayChangeAmount ?? NaN),
    });
  }

  async function refreshSnapshots() {
    // IMPORTANT: do NOT POST a new snapshot here; only READ.
    const res = await fetch("/api/portfolio/snapshot", { cache: "no-store" });
    const json = await fetchJsonOrThrow(res);

    const pts = Array.isArray(json?.points) ? json.points : [];
    setSnapPoints(
      pts.map((p: any) => ({
        day: String(p.day),
        total_usd: Number(p.total_usd ?? NaN),
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
      const nextHoldings = rows
        .map((r: any) => ({
          symbol: String(r.symbol ?? "").toUpperCase(),
          amount: Number(r.amount ?? 0),
          currency: String(r.currency ?? "USD").toUpperCase(),
        }))
        .filter((h: Holding) => h.symbol && h.amount > 0);

      setHoldings(nextHoldings);

      try {
        const fx = await getUsdBaseRates(CURRENCIES);
        setRates(normalizeRates(fx));
      } catch {}

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
    const amt = clampNonNeg(Number(amount));
    if (amt <= 0) {
      setErr("Enter a valid amount.");
      return;
    }

    const sym = pick.symbol.toUpperCase();
    const cur = currency.toUpperCase();

    setHoldings((prev) => {
      const idx = prev.findIndex((h) => h.symbol === sym && h.currency === cur);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], amount: copy[idx].amount + amt };
        return copy;
      }
      return [...prev, { symbol: sym, name: pick.name, amount: amt, currency: cur }];
    });

    setPick(null);
    setResults([]);
    setQ("");
    setAmount("");
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

      const putRes = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings }),
      });
      await fetchJsonOrThrow(putRes);

      // Create ONE snapshot after saving
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

  // filter snapshot points based on resolution
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

  // Build series for chart:
  // - sorted asc
  // - force last point (today) to equal current totalAmountUsd (live holdings)
  const { seriesDays, seriesRaw } = useMemo(() => {
    const pts = viewSnapPoints;

    const days = pts.map((p) => p.day);
    const raw = pts.map((p) => Number(p.total_usd));

    if (!days.length) {
      return { seriesDays: [todayDay], seriesRaw: [Number(totalAmountUsd)] };
    }

    const lastDay = days[days.length - 1];

    if (lastDay === todayDay) {
      raw[raw.length - 1] = Number(totalAmountUsd);
    } else if (todayDay > lastDay) {
      days.push(todayDay);
      raw.push(Number(totalAmountUsd));
    } else {
      // timezone weirdness — still make last point be live
      raw[raw.length - 1] = Number(totalAmountUsd);
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

      {/* Legend for pie */}
      {pieLegend.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {pieLegend.map((it) => (
            <div key={it.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: it.color }} />
                <span className="font-mono">{it.label}</span>
              </div>
              <div className="text-[#6B7A74]">
                {it.pct.toFixed(1)}% • {it.amount.toLocaleString()}
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

        {/* controls */}
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

        {/* chart */}
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
          <div className="text-xs text-[#6B7A74]">
            {isPublic ? "Anyone with the link can view it." : "Only you can view it."}
          </div>
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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            inputMode="decimal"
            className="col-span-7 rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="col-span-3 rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
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
            className="col-span-2 rounded-xl bg-[#22C55E] text-white text-sm font-medium hover:brightness-95"
          >
            Add
          </button>
        </div>
      </div>

      {/* Holdings list */}
      <div className="space-y-2">
        <div className="text-sm font-semibold">Holdings</div>
        {holdings.length === 0 ? (
          <div className="text-sm text-[#6B7A74]">No holdings yet.</div>
        ) : (
          holdings.map((h, i) => (
            <div
              key={`${h.symbol}-${h.currency}-${i}`}
              className="flex items-center justify-between rounded-2xl border border-[#D7E4DD] bg-white p-3"
            >
              <div>
                <div className="text-sm font-medium">
                  <span className="font-mono">{h.symbol}</span>{" "}
                  <span className="text-[#6B7A74]">({h.currency})</span>
                </div>
                <div className="text-xs text-[#6B7A74]">{h.amount.toLocaleString()}</div>
              </div>
              <button
                type="button"
                onClick={() => removeHolding(i)}
                className="rounded-xl border border-[#D7E4DD] bg-white px-3 py-1 text-sm hover:shadow-sm"
              >
                Remove
              </button>
            </div>
          ))
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

  // TOOLTIP DAY%:
  // If hovering the last (today) point, show LIVE dayChangePct so it matches header.
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