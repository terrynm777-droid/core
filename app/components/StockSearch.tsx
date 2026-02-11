"use client";

import { useState } from "react";

export default function StockSearch() {
  const [q, setQ] = useState("");
  const [out, setOut] = useState<{ symbol: string; price: number; pct: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSearch() {
    const symbol = q.trim().toUpperCase();
    if (!symbol) return;
    setLoading(true);
    setErr(null);
    setOut(null);

    try {
      const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Quote failed.");
      setOut(data);
    } catch (e: any) {
      setErr(e?.message || "Quote failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="NVDA"
          className="flex-1 rounded-2xl border border-[#E5EFEA] bg-white px-4 py-3 text-sm outline-none focus:border-[#22C55E]"
        />
        <button
          onClick={onSearch}
          disabled={loading}
          className="rounded-2xl bg-[#0B0F0E] text-white px-5 py-3 text-sm disabled:opacity-60"
        >
          {loading ? "…" : "Search"}
        </button>
      </div>

      {err && <div className="mt-2 text-sm text-red-600">{err}</div>}

      {out && (
        <div className="mt-3 rounded-2xl border border-[#E5EFEA] bg-white p-4 text-sm">
          <div className="font-semibold">{out.symbol}</div>
          <div className="mt-1 text-[#3E4C47]">
            ${out.price.toFixed(2)}{" "}
            <span className={out.pct >= 0 ? "text-[#16A34A]" : "text-red-600"}>
              ({out.pct >= 0 ? "+" : ""}
              {out.pct.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}