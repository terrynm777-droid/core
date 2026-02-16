"use client";

import { useState } from "react";

export default function StockSearch() {
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const symbol = q.trim().toUpperCase();
    if (!symbol) return setErr("Enter a ticker.");

    // call your existing endpoint here (keep your current logic)
    // ...
  }

  return (
    <div className="mt-3">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tickers (e.g., NVDA, TSLA, 7203.T)"
          className="flex-1 rounded-2xl border border-[#E5EFEA] bg-white px-4 py-3 text-sm outline-none focus:border-[#22C55E]"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
        />
        <button className="rounded-2xl bg-[#0B0F0E] text-white px-5 py-3 text-sm">
          Search
        </button>
      </form>

      {err && <div className="mt-2 text-xs text-red-600">{err}</div>}
      <div className="mt-2 text-xs text-[#6B7A74]">Pulls live quotes via your API key.</div>
    </div>
  );
}