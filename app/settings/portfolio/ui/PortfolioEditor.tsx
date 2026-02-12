"use client";

import { useEffect, useMemo, useState } from "react";

type Holding = {
  symbol: string;
  weight: number;
  notes?: string | null;
};

export default function PortfolioEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("My Portfolio");
  const [isPublic, setIsPublic] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>([
    { symbol: "AAPL", weight: 50 },
    { symbol: "MSFT", weight: 50 },
  ]);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const total = useMemo(
    () => holdings.reduce((acc, h) => acc + (Number(h.weight) || 0), 0),
    [holdings]
  );

  const chartStyle = useMemo(() => {
    let acc = 0;
    const parts = holdings
      .filter((h) => h.symbol.trim() && Number(h.weight) > 0)
      .map((h) => {
        const start = acc;
        acc += Number(h.weight);
        const end = acc;
        return { start, end };
      });

    if (parts.length === 0) {
      return { backgroundImage: "conic-gradient(#D7E4DD 0 100%)" } as any;
    }

    const palette = ["#22C55E", "#0B0F0E", "#6B7A74", "#9CA3AF", "#16A34A", "#334155"];
    const segs = parts.map((p, i) => {
      const c = palette[i % palette.length];
      return `${c} ${p.start}% ${p.end}%`;
    });

    return { backgroundImage: `conic-gradient(${segs.join(",")})` } as any;
  }, [holdings]);

  async function load() {
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load portfolio");

      setName(json?.portfolio?.name ?? "My Portfolio");
      setIsPublic(Boolean(json?.portfolio?.is_public));

      const rows = Array.isArray(json?.holdings) ? json.holdings : [];
      setHoldings(
        rows.map((r: any) => ({
          symbol: String(r.symbol ?? ""),
          weight: Number(r.weight ?? 0),
          notes: r.notes ?? null,
        }))
      );
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setRow(i: number, patch: Partial<Holding>) {
    setHoldings((prev) => prev.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));
  }

  function addRow() {
    setHoldings((prev) => [...prev, { symbol: "", weight: 0 }]);
  }

  function removeRow(i: number) {
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
      const metaJson = await metaRes.json().catch(() => null);
      if (!metaRes.ok) throw new Error(metaJson?.error || "Failed to save settings");

      const putRes = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings }),
      });
      const putJson = await putRes.json().catch(() => null);
      if (!putRes.ok) throw new Error(putJson?.error || "Failed to save holdings");

      setOk("Saved.");
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-[#6B7A74]">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div
          className="h-20 w-20 rounded-full border border-[#D7E4DD]"
          style={chartStyle}
          title="Portfolio weights"
        />
        <div className="flex-1">
          <div className="text-sm font-semibold">Total weight</div>
          <div className="text-sm text-[#6B7A74]">{total.toFixed(2)}%</div>
          <div className="text-xs text-[#6B7A74]">
            Keep ≤ 100%. (You can leave cash unallocated.)
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Portfolio name</div>
        <input
          className="w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Portfolio"
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Public portfolio</div>
          <div className="text-xs text-[#6B7A74]">
            If off, only you can view your holdings.
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Holdings</div>
          <button
            type="button"
            onClick={addRow}
            className="rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {holdings.map((h, i) => (
            <div
              key={`${h.symbol}-${i}`}
              className="grid grid-cols-12 gap-2 rounded-2xl border border-[#D7E4DD] bg-white p-3"
            >
              <input
                className="col-span-4 rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
                value={h.symbol}
                onChange={(e) => setRow(i, { symbol: e.target.value })}
                placeholder="TSLA"
              />
              <input
                className="col-span-3 rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
                value={String(h.weight)}
                onChange={(e) => setRow(i, { weight: Number(e.target.value) })}
                placeholder="25"
                inputMode="decimal"
              />
              <input
                className="col-span-4 rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm"
                value={h.notes ?? ""}
                onChange={(e) => setRow(i, { notes: e.target.value })}
                placeholder="Optional note"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="col-span-1 rounded-xl border border-[#D7E4DD] bg-white text-sm hover:shadow-sm"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
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