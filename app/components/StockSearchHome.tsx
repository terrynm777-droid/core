"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  symbol: string;
  name?: string | null;
  type?: string | null;
  exchange?: string | null;
};

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export default function StockSearchHome() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const dq = useDebounced(q.trim(), 200);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setErr(null);

      const query = dq;
      if (!query) {
        setItems([]);
        return;
      }

      // Try your existing endpoint(s). One of these is already returning JSON on your site.
      const a = await fetchJson(`/api/symbols?q=${encodeURIComponent(query)}`);
      const b = a ?? (await fetchJson(`/api/stocks/search?q=${encodeURIComponent(query)}`));

      const raw = b?.results ?? b?.items ?? b;
      const arr: Item[] = Array.isArray(raw) ? raw : [];

      // normalize
      const normalized = arr
        .map((x: any) => ({
          symbol: String(x?.symbol || "").toUpperCase(),
          name: x?.name ? String(x.name) : null,
          type: x?.type ? String(x.type) : null,
          exchange: x?.exchange ? String(x.exchange) : null,
        }))
        .filter((x) => x.symbol);

      if (!cancelled) {
        setItems(normalized.slice(0, 10));
        setOpen(true);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [dq]);

  const canSubmit = useMemo(() => q.trim().length > 0, [q]);

  function go(symbolRaw: string) {
    const symbol = symbolRaw.trim().toUpperCase();
    if (!symbol) return;

    // IMPORTANT:
    // Your stock page route must exist as: app/s/[symbol]/page.tsx
    router.push(`/s/${encodeURIComponent(symbol)}`);
    setOpen(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const symbol = q.trim().toUpperCase();
    if (!symbol) return;

    // If user typed “apple”, try first dropdown, otherwise just go with what they typed.
    const top = items[0]?.symbol;
    go(top || symbol);
  }

  return (
    <div ref={boxRef} className="mt-3 relative">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            if (items.length) setOpen(true);
          }}
          placeholder="Search tickers (e.g., NVDA, TSLA, 7203.T)"
          className="flex-1 rounded-2xl border border-[#E5EFEA] bg-white px-4 py-3 text-sm outline-none focus:border-[#22C55E]"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
        />
        <button
          disabled={!canSubmit}
          className="rounded-2xl bg-[#0B0F0E] text-white px-5 py-3 text-sm disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {err && <div className="mt-2 text-xs text-red-600">{err}</div>}

      {open && items.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-[#D7E4DD] bg-white shadow-sm overflow-hidden">
          {items.map((it) => (
            <button
              key={`${it.symbol}-${it.name ?? ""}`}
              type="button"
              onClick={() => go(it.symbol)}
              className="w-full text-left px-4 py-3 hover:bg-[#F7FAF8] flex items-center justify-between gap-4"
            >
              <div>
                <div className="text-sm font-semibold">{it.symbol}</div>
                {it.name ? <div className="text-xs text-[#6B7A74] truncate">{it.name}</div> : null}
              </div>
              <div className="text-xs text-[#6B7A74]">
                {it.exchange ? it.exchange : it.type ? it.type : ""}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}