// lib/prices.ts
export type Quote = {
  symbol: string;
  price: number; // last/close price
  currency: string; // quote currency, usually "USD" for US stocks
};

const FINNHUB = "https://finnhub.io/api/v1";

export async function getQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) throw new Error("Missing FINNHUB_API_KEY");

  const uniq = Array.from(new Set(symbols.map((s) => s.trim().toUpperCase()))).filter(Boolean);
  const out: Record<string, Quote> = {};

  // Finnhub is 1 symbol per request for quote.
  // Keep it simple; you can batch/parallelize later.
  for (const symbol of uniq) {
    const url = `${FINNHUB}/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) continue;
    const q = (await res.json()) as any;

    // finnhub: c=current, pc=prev close
    const price = Number(q?.c ?? 0);
    if (!Number.isFinite(price) || price <= 0) continue;

    out[symbol] = { symbol, price, currency: "USD" };
  }

  return out;
}