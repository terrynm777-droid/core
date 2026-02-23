"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Row = { symbol: string; price: number; pct: number };

export default function TrendingLive() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      const res = await fetch("/api/trending", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load trending.");
      setRows(data.rows as Row[]);
    } catch (e: any) {
      setErr(e?.message || "Failed to load trending.");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mt-4">
      {err ? (
        <div className="rounded-2xl border border-[#E5EFEA] bg-white p-4 text-sm text-red-600">
          {err}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {rows.map((x) => {
            const sign = x.pct > 0 ? "+" : "";
            const pctClass = x.pct >= 0 ? "text-[#16A34A]" : "text-red-600";
            return (
              <Link
                key={x.symbol}
                href={`/p/${encodeURIComponent(x.symbol)}`}
                className="block"
              >
                <div className="rounded-2xl border border-[#E5EFEA] bg-[#F4FBF6] p-4">
                  <div className="text-sm font-semibold">{x.symbol}</div>
                  <div className="text-xs text-[#3E4C47] mt-1">
                    ${x.price.toFixed(2)}{" "}
                    <span className={pctClass}>
                      ({sign}
                      {x.pct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}