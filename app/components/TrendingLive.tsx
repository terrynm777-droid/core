"use client";

import { useEffect, useState } from "react";

type Row = { symbol: string; price: number; change: number; pct: number };

export default function TrendingLive() {
  const [rows, setRows] = useState<Row[] | null>(null);

  async function load() {
    const r = await fetch("/api/quotes", { cache: "no-store" });
    const j = await r.json();
    setRows(j.results);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!rows) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-3">
        {["AAPL", "NVDA", "TSLA", "MSFT"].map((t) => (
          <div key={t} className="rounded-2xl border border-[#E5EFEA] bg-[#F4FBF6] p-4">
            <div className="text-sm font-semibold">{t}</div>
            <div className="text-xs text-[#6B7A74] mt-1">Loading…</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {rows.map((x) => {
        const sign = x.pct > 0 ? "+" : "";
        return (
          <div key={x.symbol} className="rounded-2xl border border-[#E5EFEA] bg-[#F4FBF6] p-4">
            <div className="text-sm font-semibold">{x.symbol}</div>
            <div className="text-xs text-[#3E4C47] mt-1">
              ${x.price?.toFixed(2)}{" "}
              <span className={x.pct >= 0 ? "text-[#16A34A]" : "text-red-600"}>
                ({sign}{x.pct?.toFixed(2)}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}