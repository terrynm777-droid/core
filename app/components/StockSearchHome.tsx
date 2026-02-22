"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Result = {
  symbol: string;
  name: string;
};

export default function StockSearchHome() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const term = q.trim();
      if (!term) {
        setResults([]);
        return;
      }

      const res = await fetch(`/api/symbols?q=${encodeURIComponent(term)}`);
      const json = await res.json();

      setResults(json.results?.slice(0, 6) || []);
      setOpen(true);
    };

    const t = setTimeout(run, 250);
    return () => clearTimeout(t);
  }, [q]);

  function go(symbol: string) {
    setOpen(false);
    router.push(`/stock/${encodeURIComponent(symbol)}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!results.length) return;
    go(results[0].symbol);
  }

  return (
    <div className="relative mt-3">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tickers (e.g., NVDA, TSLA, 7203.T)"
          className="flex-1 rounded-2xl border border-[#E5EFEA] bg-white px-4 py-3 text-sm outline-none focus:border-[#22C55E]"
        />
        <button className="rounded-2xl bg-[#0B0F0E] text-white px-5 py-3 text-sm">
          Search
        </button>
      </form>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-[#D7E4DD] bg-white shadow-sm overflow-hidden">
          {results.map((r) => (
            <button
              key={r.symbol}
              onClick={() => go(r.symbol)}
              className="w-full text-left px-4 py-3 hover:bg-[#F7FAF8]"
            >
              <div className="text-sm font-semibold">{r.symbol}</div>
              <div className="text-xs text-[#6B7A74]">{r.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}