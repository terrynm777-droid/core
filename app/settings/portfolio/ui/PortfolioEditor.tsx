"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Currency = "USD" | "JPY" | "AUD" | "HKD" | "EUR" | "GBP" | "CNY";

type Position = {
  symbol: string;
  amount: number; // amount in selected currency (for now)
  currency: Currency;
};

type SymbolResult = { symbol: string; description: string };

const CURRENCIES: Currency[] = ["USD", "JPY", "AUD", "HKD", "EUR", "GBP", "CNY"];

function normalizeSymbol(s: string) {
  return s.trim().toUpperCase();
}

export default function PortfolioEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [portfolio, setPortfolio] = useState<Position[] | null>(null);
  const [portfolioPublic, setPortfolioPublic] = useState<boolean>(true);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // add modal-ish state
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SymbolResult[]>([]);
  const [picked, setPicked] = useState<SymbolResult | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("USD");

  const debounceRef = useRef<any>(null);

  // Load existing portfolio
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);

      const res = await fetch("/api/portfolio", { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setErr(json?.error || "Failed to load portfolio");
        setLoading(false);
        return;
      }

      setPortfolio((json?.portfolio as Position[]) ?? null);
      setPortfolioPublic(Boolean(json?.portfolio_public ?? true));
      setLoading(false);
    })();
  }, []);

  // Search symbols (debounced)
  useEffect(() => {
    if (!adding) return;
    if (!q.trim()) {
      setResults([]);
      setPicked(null);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/symbols?q=${encodeURIComponent(q.trim())}`, {
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          setResults([]);
          return;
        }
        setResults((json?.results as SymbolResult[]) ?? []);
      } catch {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [q, adding]);

  const hasPortfolio = Array.isArray(portfolio);

  function startCreate() {
    setPortfolio([]);
    setOk(null);
    setErr(null);
  }

  function openAdd() {
    setAdding(true);
    setQ("");
    setResults([]);
    setPicked(null);
    setAmount("");
    setCurrency("USD");
    setOk(null);
    setErr(null);
  }

  function closeAdd() {
    setAdding(false);
    setQ("");
    setResults([]);
    setPicked(null);
    setAmount("");
    setCurrency("USD");
  }

  const canAdd = useMemo(() => {
    if (!picked?.symbol) return false;
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return false;
    return true;
  }, [picked, amount]);

  function doAdd() {
    if (!portfolio) return;
    if (!picked) return;

    const sym = normalizeSymbol(picked.symbol);
    const n = Number(amount);

    const next = [...portfolio];
    const existingIdx = next.findIndex((p) => normalizeSymbol(p.symbol) === sym);

    if (existingIdx >= 0) {
      next[existingIdx] = { symbol: sym, amount: n, currency };
    } else {
      next.push({ symbol: sym, amount: n, currency });
    }

    setPortfolio(next);
    closeAdd();
  }

  function removeSymbol(sym: string) {
    if (!portfolio) return;
    setPortfolio(portfolio.filter((p) => normalizeSymbol(p.symbol) !== normalizeSymbol(sym)));
  }

  async function save() {
    if (!portfolio) return;

    setSaving(true);
    setErr(null);
    setOk(null);

    const res = await fetch("/api/portfolio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portfolio,
        portfolio_public: portfolioPublic,
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      setErr(json?.error || "Save failed");
      setSaving(false);
      return;
    }

    setOk("Saved.");
    setSaving(false);
  }

  // Simple pie “data” (no live FX yet)
  const pieData = useMemo(() => {
    if (!portfolio || portfolio.length === 0) return [];
    return portfolio.map((p) => ({
      name: p.symbol,
      value: p.amount,
      currency: p.currency,
    }));
  }, [portfolio]);

  if (loading) return <div className="text-sm text-[#6B7A74]">Loading…</div>;

  return (
    <div className="space-y-4">
      {!hasPortfolio ? (
        <button
          onClick={startCreate}
          className="w-full rounded-2xl bg-[#22C55E] px-4 py-3 text-white font-medium hover:bg-[#16A34A]"
        >
          Create portfolio
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Positions</div>

            <button
              onClick={openAdd}
              className="inline-flex items-center justify-center rounded-2xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm font-medium hover:shadow-sm"
            >
              + Add
            </button>
          </div>

          {portfolio.length === 0 ? (
            <div className="text-sm text-[#6B7A74]">
              No positions yet. Press <span className="font-medium">+ Add</span>.
            </div>
          ) : (
            <div className="space-y-2">
              {portfolio.map((p) => (
                <div
                  key={p.symbol}
                  className="flex items-center justify-between rounded-xl border border-[#D7E4DD] bg-white px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-semibold">{p.symbol}</div>
                    <div className="text-xs text-[#6B7A74]">
                      {p.currency} {p.amount.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => removeSymbol(p.symbol)}
                    className="rounded-xl border border-[#D7E4DD] bg-white px-3 py-1 text-xs font-medium hover:shadow-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Chart placeholder (we’ll make it live next) */}
          <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-4">
            <div className="text-sm font-semibold">Portfolio chart</div>
            <div className="mt-2 text-xs text-[#6B7A74]">
              (Next step: live prices + currency normalization)
            </div>

            {pieData.length === 0 ? (
              <div className="mt-3 text-sm text-[#6B7A74]">Add positions to generate chart.</div>
            ) : (
              <div className="mt-3 space-y-1 text-sm">
                {pieData.map((x) => (
                  <div key={x.name} className="flex justify-between">
                    <span>{x.name}</span>
                    <span>
                      {x.currency} {Number(x.value).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Always-available plus near chart */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={openAdd}
                className="inline-flex items-center justify-center rounded-full bg-[#0B0F0E] px-4 py-2 text-sm font-medium text-white hover:brightness-95"
              >
                + Add position
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={portfolioPublic}
              onChange={(e) => setPortfolioPublic(e.target.checked)}
            />
            Make portfolio public
          </label>

          {err ? <div className="text-sm text-red-600">{err}</div> : null}
          {ok ? <div className="text-sm text-green-600">{ok}</div> : null}

          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-2xl bg-[#22C55E] px-4 py-3 text-white font-medium disabled:opacity-50 hover:bg-[#16A34A]"
          >
            {saving ? "Saving…" : "Save portfolio"}
          </button>
        </>
      )}

      {/* Add panel */}
      {adding ? (
        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Add position</div>
            <button
              onClick={closeAdd}
              className="rounded-xl border border-[#D7E4DD] bg-white px-3 py-1 text-xs font-medium hover:shadow-sm"
            >
              Close
            </button>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <div className="text-xs text-[#6B7A74]">Search stock</div>
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPicked(null);
                }}
                className="mt-1 w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
                placeholder="e.g. AAPL, TSLA, 0700.HK"
              />

              {results.length > 0 ? (
                <div className="mt-2 max-h-56 overflow-auto rounded-xl border border-[#D7E4DD]">
                  {results.map((r) => (
                    <button
                      key={r.symbol}
                      type="button"
                      onClick={() => {
                        setPicked(r);
                        setQ(r.symbol);
                        setResults([]);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#F3F7F5]"
                    >
                      <div className="font-semibold">{r.symbol}</div>
                      <div className="text-xs text-[#6B7A74]">{r.description}</div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <div className="text-xs text-[#6B7A74]">Amount invested</div>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
                  placeholder="e.g. 5000"
                  inputMode="decimal"
                />
              </div>

              <div>
                <div className="text-xs text-[#6B7A74]">Currency</div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="mt-1 w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={doAdd}
              disabled={!canAdd}
              className="w-full rounded-2xl bg-[#0B0F0E] px-4 py-3 text-white font-medium disabled:opacity-50 hover:brightness-95"
            >
              Add to portfolio
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}