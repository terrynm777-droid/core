"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SearchItem = {
  symbol: string;
  name?: string | null;
  type?: string | null;
  source?: string | null;
};

function useDebouncedValue<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function StockSearchHome() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<number>(-1);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const debounced = useDebouncedValue(q, 200);

  const trimmed = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const query = debounced.trim();
    if (!query) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`, {
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        if (cancelled) return;

        const list = Array.isArray(json?.results) ? json.results : [];
        setItems(list);
        setOpen(true);
        setActive(-1);
      } catch {
        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  function go(symbol: string) {
    const s = symbol.trim().toUpperCase();
    if (!s) return;
    setOpen(false);
    router.push(`/s/${encodeURIComponent(s)}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const s = trimmed.toUpperCase();
    if (!s) return;
    go(s);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (active >= 0 && active < items.length) {
        e.preventDefault();
        go(items[active].symbol);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative mt-3">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (items.length) setOpen(true);
          }}
          onKeyDown={onKeyDown}
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

      {open && (loading || items.length) ? (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-[#D7E4DD] bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 text-xs text-[#6B7A74]">Searching…</div>
          ) : (
            <ul className="max-h-72 overflow-auto">
              {items.map((it, idx) => (
                <li key={`${it.symbol}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => go(it.symbol)}
                    onMouseEnter={() => setActive(idx)}
                    className={[
                      "w-full text-left px-4 py-3 text-sm flex items-center justify-between",
                      idx === active ? "bg-[#F7FAF8]" : "bg-white",
                    ].join(" ")}
                  >
                    <span className="font-semibold">{it.symbol}</span>
                    <span className="ml-3 text-xs text-[#6B7A74] truncate max-w-[70%]">
                      {it.name || ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}