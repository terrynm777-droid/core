"use client";

import { useEffect, useMemo, useState } from "react";

type SymbolResult = {
  symbol: string;
  name: string;
  type: string;
};

type Holding = {
  symbol: string;
  name?: string;
  amount: number;
  currency: string;
};

const CURRENCIES = ["USD","JPY","AUD","HKD","EUR","GBP","CNY","CAD","CHF","SGD"];
const PALETTE = ["#22C55E", "#0B0F0E", "#6B7A74", "#9CA3AF", "#16A34A", "#334155"];

function clamp(n: number) {
  if (!isFinite(n)) return 0;
  if (n < 0) return 0;
  return n;
}

export default function PortfolioEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("My Portfolio");
  const [isPublic, setIsPublic] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>([]);

  // add flow
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SymbolResult[]>([]);
  const [pick, setPick] = useState<SymbolResult | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState("USD");

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // live value
  const [live, setLive] = useState<any>(null);
  const [snapPoints, setSnapPoints] = useState<{ day: string; total_usd: number }[]>([]);

  const totalAmount = useMemo(
    () => holdings.reduce((a, h) => a + (Number(h.amount) || 0), 0),
    [holdings]
  );

  const pieStyle = useMemo(() => {
    if (totalAmount <= 0 || holdings.length === 0) {
      return { backgroundImage: "conic-gradient(#D7E4DD 0 100%)" } as any;
    }

    let acc = 0;
    const segs: string[] = [];
    holdings.forEach((h, i) => {
      const w = (h.amount / totalAmount) * 100;
      const start = acc;
      const end = acc + w;
      acc = end;
      segs.push(`${PALETTE[i % PALETTE.length]} ${start}% ${end}%`);
    });

    return { backgroundImage: `conic-gradient(${segs.join(",")})` } as any;
  }, [holdings, totalAmount]);

  const pieLegend = useMemo(() => {
    if (totalAmount <= 0 || holdings.length === 0) return [];
    return holdings.map((h, i) => {
      const pct = (h.amount / totalAmount) * 100;
      return {
        key: `${h.symbol}-${h.currency}-${i}`,
        color: PALETTE[i % PALETTE.length],
        label: `${h.symbol} (${h.currency})`,
        pct,
        amount: h.amount,
      };
    });
  }, [holdings, totalAmount]);

  async function load() {
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(`${res.status} ${json?.error || "Failed to load portfolio"}`);

      setName(json?.portfolio?.name ?? "My Portfolio");
      setIsPublic(Boolean(json?.portfolio?.is_public));

      const rows = Array.isArray(json?.holdings) ? json.holdings : [];
      setHoldings(
        rows.map((r: any) => ({
          symbol: String(r.symbol ?? "").toUpperCase(),
          amount: Number(r.amount ?? 0),
          currency: String(r.currency ?? "USD").toUpperCase(),
        })).filter((h: Holding) => h.symbol && h.amount > 0)
      );

      await refreshLive();
      await refreshSnapshots();
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function refreshLive() {
    const res = await fetch("/api/portfolio/value", { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (res.ok) setLive(json);
  }

  async function refreshSnapshots() {
    // Create/refresh today's snapshot
    await fetch("/api/portfolio/snapshot", { method: "POST" });

    // Load daily points
    const res = await fetch("/api/portfolio/snapshot", { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (res.ok) {
      const pts = Array.isArray(json?.points) ? json.points : [];
      setSnapPoints(pts.map((p: any) => ({ day: String(p.day), total_usd: Number(p.total_usd ?? 0) })));
    }
  }

  useEffect(() => {
    load();
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
    const json = await res.json().catch(() => null);
    if (res.ok) setResults(Array.isArray(json?.results) ? json.results : []);
  }

  function addHolding() {
    setErr(null);
    setOk(null);

    if (!pick?.symbol) {
      setErr("Pick a stock/crypto from the search results.");
      return;
    }
    const amt = clamp(Number(amount));
    if (amt <= 0) {
      setErr("Enter a valid amount.");
      return;
    }

    const sym = pick.symbol.toUpperCase();
    setHoldings((prev) => {
      const idx = prev.findIndex((h) => h.symbol === sym && h.currency === currency);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], amount: copy[idx].amount + amt };
        return copy;
      }
      return [...prev, { symbol: sym, name: pick.name, amount: amt, currency }];
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
      // save meta
      const metaRes = await fetch("/api/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, is_public: isPublic }),
      });
      const metaJson = await metaRes.json().catch(() => null);
      if (!metaRes.ok) throw new Error(`${metaRes.status} ${metaJson?.error || "Failed to save settings"}`);

      // save holdings replace-all
      const putRes = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings }),
      });
      const putJson = await putRes.json().catch(() => null);
      if (!putRes.ok) throw new Error(`${putRes.status} ${putJson?.error || "Failed to save holdings"}`);

      setOk("Saved.");
      await refreshLive();
      await refreshSnapshots();
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-[#6B7A74]">Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Pie + live change */}
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 rounded-full border border-[#D7E4DD]" style={pieStyle} />
        <div className="flex-1">
          <div className="text-sm font-semibold">Portfolio</div>
          <div className="text-sm text-[#6B7A74]">Total allocation: {totalAmount.toFixed(2)}</div>

          {live ? (
            <div className="mt-1 text-sm">
              Today:{" "}
              <span className={Number(live.dayChangePct) >= 0 ? "text-green-600" : "text-red-600"}>
                {Number(live.dayChangePct).toFixed(2)}% ({Number(live.dayChangeAmount).toFixed(2)})
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Legend for pie (names + colors) */}
      {pieLegend.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {pieLegend.map((it) => (
            <div key={it.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: it.color }} />
                <span className="font-mono">{it.label}</span>
              </div>
              <div className="text-[#6B7A74]">
                {it.pct.toFixed(1)}% • {it.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Daily performance bars */}
      <div className="rounded-2xl border border-[#D7E4DD] bg-white p-4">
        <div className="text-sm font-semibold">Last 30 days (daily)</div>
        <div className="mt-3 flex items-end gap-1 h-24">
          {snapPoints.length === 0 ? (
            <div className="text-xs text-[#6B7A74]">No history yet.</div>
          ) : (
            (() => {
              const max = Math.max(...snapPoints.map((p) => p.total_usd), 1);
              return snapPoints.map((p, i) => (
                <div
                  key={p.day + i}
                  title={`${p.day}: ${p.total_usd.toFixed(2)}`}
                  className="flex-1 rounded-sm bg-[#D7E4DD]"
                  style={{ height: `${(p.total_usd / max) * 100}%` }}
                />
              ));
            })()
          )}
        </div>
        <div className="mt-2 text-xs text-[#6B7A74]">
          (This tracks your allocation total unless you add real pricing + FX conversion.)
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

      {/* Create portfolio flow */}
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
                onClick={() => {
                  setPick(r);
                  setResults([]);
                  setQ(`${r.symbol} — ${r.name}`);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#F7FAF8]"
              >
                <span className="font-mono">{r.symbol}</span>{" "}
                <span className="text-[#6B7A74]">— {r.name}</span>
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
              <option key={c} value={c}>{c}</option>
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
                <div className="text-xs text-[#6B7A74]">{h.amount.toFixed(2)}</div>
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
