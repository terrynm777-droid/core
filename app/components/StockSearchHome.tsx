"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Result = {
  symbol: string;
  name?: string;
};

export default function StockSearchHome() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const id = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/symbols?q=${encodeURIComponent(q)}`);
        const json = await res.json();

        setResults((json.results || []).slice(0, 8));
        setOpen(true);
      } catch {
        setResults([]);
        setOpen(false);
      }

      setLoading(false);
    }, 200);

    return () => clearTimeout(id);
  }, [q]);

  function go(symbol: string) {
    router.push(`/s/${symbol.toUpperCase()}`);
  }

  return (
    <div className="relative mt-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) go(q.trim());
        }}
        className="flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tickers (e.g., NVDA, TSLA)"
          className="flex-1 rounded-2xl border border-[#E5EFEA] bg-white px-4 py-3 text-sm outline-none focus:border-[#22C55E]"
        />

        <button className="rounded-2xlxl bg-[#0B0F0E] text-white px-5 py-3 text-sm">
          Search
        </button>
      </form>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-[#E5EFEA] bg-white shadow">
          {loading && (
            <div className="px-4 py-3 text-sm text-[#6B7A74]">Searching…</div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-[#6B7A74]">No matches</div>
          )}

          {results.map((r) => (
            <button
              key={r.symbol}
              type="button"
              onMouseDown={() => go(r.symbol)}
              className="block w-full px-4 py-3 text-left hover:bg-[#F7FAF8]"
            >
              <div className="font-mono">{r.symbol}</div>
              <div className="text-xs text-[#6B7A74]">{r.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}