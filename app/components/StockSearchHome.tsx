"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SymbolResult = {
  symbol: string;
  name?: string | null;
  type?: string | null;
};

function safeStr(x: any, fallback = "") {
  const s = String(x ?? "").trim();
  return s ? s : fallback;
}

function isStockLike(r: SymbolResult) {
  // Adjust if your API uses different type strings.
  // Goal: include equities/etf/crypto, exclude users (if users ever appear).
  const t = safeStr(r.type).toLowerCase();
  if (!t) return true;
  return t.includes("stock") || t.includes("equity") || t.includes("etf") || t.includes("crypto");
}

async function fetchJsonOrThrow(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}
  if (!res.ok) {
    const msg = String(json?.error || text || res.statusText || "Request failed").trim();
    throw new Error(msg);
  }
  return json;
}

export default function StockSearchHome() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [results, setResults] = useState<SymbolResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);

  const trimmed = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    let alive = true;

    async function run() {
      const t = trimmed;
      if (t.length < 1) {
        setResults([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      try {
        const json = await fetchJsonOrThrow(`/api/symbols?q=${encodeURIComponent(t)}`);
        const raw: SymbolResult[] = Array.isArray(json?.results) ? json.results : [];
        const filtered = raw.filter(isStockLike).slice(0, 10);
        if (!alive) return;
        setResults(filtered);
        setOpen(true);
      } catch {
        if (!alive) return;
        setResults([]);
        setOpen(false);
      } finally {
        if (alive) setLoading(false);
      }
    }

    // small debounce to stop spam
    const id = window.setTimeout(run, 150);
    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, [trimmed]);

  function go(sym: string) {
    const s = safeStr(sym).toUpperCase();
    if (!s) return;
    setOpen(false);
    router.push(`/s/${encodeURIComponent(s)}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // If user typed something but didn't click a dropdown result,
    // just route to /s/QUERY
    if (trimmed) go(trimmed);
  }

  return (
    <div ref={wrapRef}>
      <div className="text-sm font-semibold">Stock search</div>

      <form onSubmit={onSubmit} className="mt-2 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            if (results.length) setOpen(true);
          }}
          placeholder="Search tickers (e.g., NVDA, TSLA, 7203.T)"
          className="flex-1 rounded-2xl border border-[#D7E4DD] bg-white px-4 py-3 text-sm outline-none focus:border-[#2E9B5D]"
        />
        <button
          type="submit"
          className="rounded-2xl bg-[#0B0F0E] px-6 py-3 text-sm font-semibold text-white hover:opacity-95"
        >
          Search
        </button>
      </form>

      {open ? (
        <div className="mt-2 overflow-hidden rounded-2xl border border-[#D7E4DD] bg-white shadow-sm">
          {loading ? (
            <div className="px-4 py-3 text-sm text-[#6B7A74]">Searching…</div>
          ) : results.length ? (
            results.map((r) => (
              <button
                key={`${r.symbol}-${r.type ?? ""}`}
                type="button"
                onMouseDown={(e) => {
                  // prevents input blur from killing click
                  e.preventDefault();
                  go(r.symbol);
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-[#F7FAF8]"
              >
                <div className="font-mono">{safeStr(r.symbol).toUpperCase()}</div>
                {r.name ? <div className="text-xs text-[#6B7A74]">{r.name}</div> : null}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-[#6B7A74]">No matches.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}