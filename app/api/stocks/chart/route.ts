import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function finnhubKey() {
  const k = process.env.FINNHUB_API_KEY;
  if (!k) throw new Error("Missing FINNHUB_API_KEY");
  return k;
}

function normalizeForStooq(symbol: string) {
  // Stooq examples:
  // AAPL -> aapl.us
  // MSFT -> msft.us
  // If user passes a suffix already, just lower it.
  const s = symbol.trim().toUpperCase();
  if (!s) return "";
  if (s.includes(".")) return s.toLowerCase();

  // default to US for now
  return `${s.toLowerCase()}.us`;
}

function parseStooqCsv(csv: string) {
  // CSV: Date,Open,High,Low,Close,Volume
  const lines = csv.trim().split("\n");
  if (lines.length <= 1) return [];

  const out: { t: string; c: number }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;
    const parts = row.split(",");
    if (parts.length < 5) continue;
    const date = parts[0];
    const close = Number(parts[4]);
    if (!date || !isFinite(close)) continue;
    out.push({ t: date, c: close });
  }
  return out;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = String(searchParams.get("symbol") || "").trim().toUpperCase();
  const range = String(searchParams.get("range") || "7d").toLowerCase();

  if (!symbol) return NextResponse.json({ error: "Missing symbol" }, { status: 400 });

  // ranges: 7d / 1m / 3m / 6m / 1y
  const days =
    range === "7d" ? 7 :
    range === "1m" ? 31 :
    range === "3m" ? 92 :
    range === "1y" ? 365 : 183;

  const now = Math.floor(Date.now() / 1000);
  const from = now - days * 24 * 60 * 60;

  // 1) Try Finnhub candle
  try {
    const key = finnhubKey();
    const url =
      `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}` +
      `&resolution=D&from=${from}&to=${now}&token=${key}`;

    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json().catch(() => null);

    if (res.ok && json && json.s === "ok" && Array.isArray(json.c) && Array.isArray(json.t)) {
      const points = json.t.map((ts: number, i: number) => ({
        t: new Date(ts * 1000).toISOString().slice(0, 10),
        c: Number(json.c[i] ?? 0),
      }));
      return NextResponse.json({ points }, { status: 200 });
    }

    // If Finnhub returns access error / forbidden / unauthorized, fall through to Stooq.
    const msg = String(json?.error || "");
    const shouldFallback =
      res.status === 401 ||
      res.status === 403 ||
      msg.toLowerCase().includes("access");

    if (!shouldFallback) {
      // Non-access Finnhub failure: still fallback (better UX), but keep a reason.
      // Continue to Stooq anyway.
    }
  } catch {
    // continue to fallback
  }

  // 2) Fallback: Stooq daily CSV (no key)
  try {
    const stooqSymbol = normalizeForStooq(symbol);
    if (!stooqSymbol) return NextResponse.json({ points: [] }, { status: 200 });

    const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSymbol)}&i=d`;
    const res = await fetch(url, { cache: "no-store" });
    const csv = await res.text();

    // Stooq can return "No data" html-ish text sometimes
    if (!res.ok || !csv || csv.toLowerCase().includes("no data")) {
      return NextResponse.json({ points: [] }, { status: 200 });
    }

    let points = parseStooqCsv(csv);

    // Keep only last N days worth of rows (stooq returns full history)
    if (points.length > days + 5) points = points.slice(-1 * (days + 5));

    return NextResponse.json({ points }, { status: 200 });
  } catch {
    return NextResponse.json({ points: [] }, { status: 200 });
  }
}