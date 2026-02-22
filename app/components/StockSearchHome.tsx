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

async function fetchJson(url: string) {
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
  const [error, setError] = useState<string | null>(null);

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

      // If empty: close dropdown
      if (!t) {
        setResults([]);
        setError(null);
        setOpen(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const json = await fetchJson(`/api/symbols?q=${encodeURIComponent(t)}`);
        const raw: SymbolResult[] = Array.isArray(json?.results) ? json.results : [];

        // Keep it simple: don’t over-filter here. If your API returns users,
        // fix the API route (section B below).
        const filtered = raw
          .filter((r) => safeStr(r.symbol))
          .slice(0, 10);

        if (!alive) return;

        setResults(filtered);
        setOpen(true);
      } catch (e: any) {
        if (!alive) return;

        // IMPORTANT: keep dropdown open and show the error instead of “nothing”
        setResults([]);
        setError(e?.message ?? "Symbol search failed");
        setOpen(true);
      } finally {
        if (alive) setLoading(false);
      }
    }

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
    if (trimmed) go(trimmed);
  }

  return (
    <div ref={wrapRef}>
      <form onSubmit={onSubmit} className="mt-2 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            if (trimmed) setOpen(true);
          }}
          placeholder="Search tickers (e.g., NVDA, TSLA, 7203.T)"
          className="flex-1 rounded-2xl border border-[#D7E4DD] bg-white px-4 py-3 text-sm outline-none focus:border-[#2E9B5D]"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
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
          ) : error ? (
            <div className="px-4 py-3 text-sm text-red-600">
              {error}
              <div className="mt-1 text-xs text-[#6B7A74]">
                You can still press Search to go to /s/{trimmed.toUpperCase()}.
              </div>
            </div>
          ) : results.length ? (
            results.map((r) => (
              <button
                key={`${r.symbol}-${r.type ?? ""}-${r.name ?? ""}`}
                type="button"
                onMouseDown={(e) => {
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