"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StockSearchHome() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const symbol = q.trim().toUpperCase();
    if (!symbol) return;

    router.push(`/s/${encodeURIComponent(symbol)}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search ticker (e.g. AAPL)"
        className="flex-1 rounded-2xl border border-[#E5EFEA] bg-white px-4 py-3 text-sm outline-none focus:border-[#22C55E]"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
      />

      <button className="rounded-2xl bg-[#0B0F0E] text-white px-5 py-3 text-sm">
        Search
      </button>
    </form>
  );
}