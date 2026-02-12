"use client";

import { useEffect, useMemo, useState } from "react";

type Holding = { symbol: string; shares: number };

function parseHoldings(text: string): Holding[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const out: Holding[] = [];
  for (const line of lines) {
    const parts = line.replace(/,/g, " ").split(/\s+/).filter(Boolean);
    if (parts.length < 2) continue;

    const symbol = parts[0].toUpperCase();
    const shares = Number(parts[1]);

    if (!/^[A-Z.\-]{1,10}$/.test(symbol)) continue;
    if (!Number.isFinite(shares) || shares <= 0) continue;

    out.push({ symbol, shares });
  }
  return out;
}

function formatHoldings(holdings: Holding[]) {
  return holdings.map((h) => `${h.symbol} ${h.shares}`).join("\n");
}

export default function PortfolioEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [portfolioPublic, setPortfolioPublic] = useState(false);
  const [text, setText] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const holdings = useMemo(() => parseHoldings(text), [text]);
  const canSave = holdings.length > 0;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);

      const res = await fetch("/api/portfolio", { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setErr(json?.error || "Failed to load portfolio");
        setLoading(false);
        return;
      }

      const p = json?.portfolio ?? [];
      const pub = Boolean(json?.portfolio_public);

      setText(formatHoldings(Array.isArray(p) ? p : []));
      setPortfolioPublic(pub);
      setLoading(false);
    })();
  }, []);

  async function onSave() {
    setSaving(true);
    setErr(null);
    setOk(null);

    const res = await fetch("/api/portfolio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portfolio: holdings,
        portfolio_public: portfolioPublic,
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      setErr(json?.error || "Save failed");
      setSaving(false);
      return;
    }

    setOk("Saved.");
    setSaving(false);
  }

  if (loading) return <div className="text-sm text-[#6B7A74]">Loading…</div>;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold">Holdings</div>
        <div className="text-xs text-[#6B7A74]">
          One per line. Example:
          <span className="ml-2 font-mono text-[#3E4C47]">AAPL 50</span>
        </div>

        <textarea
          className="mt-2 w-full rounded-xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm min-h-[160px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"AAPL 50\nMSFT 10\nTSLA 5"}
        />

        <div className="mt-2 text-xs text-[#6B7A74]">
          Parsed holdings:{" "}
          <span className="font-mono text-[#3E4C47]">{holdings.length}</span>
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={portfolioPublic}
          onChange={(e) => setPortfolioPublic(e.target.checked)}
        />
        Make my portfolio public (visible on my profile)
      </label>

      {err ? <div className="text-sm text-red-600">{err}</div> : null}
      {ok ? <div className="text-sm text-green-600">{ok}</div> : null}

      <button
        onClick={onSave}
        disabled={!canSave || saving}
        className="w-full rounded-2xl bg-[#22C55E] px-4 py-3 text-white font-medium disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>

      {!canSave ? (
        <div className="text-xs text-[#6B7A74]">
          Add at least 1 valid holding to save.
        </div>
      ) : null}
    </div>
  );
}