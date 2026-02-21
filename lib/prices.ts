// lib/prices.ts
type Quote = { price: number; prevClose: number };

const TTL_MS = 15_000;
const cache = new Map<string, { at: number; q: Quote }>();

function normSym(s: string) {
  return String(s || "").trim().toUpperCase();
}

export async function getLiveQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Missing FINNHUB_API_KEY");

  const uniq = Array.from(new Set(symbols.map(normSym))).filter(Boolean);
  const out: Record<string, Quote> = {};

  const now = Date.now();
  const need: string[] = [];

  for (const sym of uniq) {
    const hit = cache.get(sym);
    if (hit && now - hit.at < TTL_MS) {
      out[sym] = hit.q;
    } else {
      need.push(sym);
    }
  }

  await Promise.all(
    need.map(async (sym) => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${encodeURIComponent(key)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Finnhub quote failed for ${sym}: ${res.status}`);
      const j = (await res.json()) as any;

      const price = Number(j?.c ?? 0);      // current
      const prevClose = Number(j?.pc ?? 0); // previous close

      const q = { price: Number.isFinite(price) ? price : 0, prevClose: Number.isFinite(prevClose) ? prevClose : 0 };
      cache.set(sym, { at: Date.now(), q });
      out[sym] = q;
    })
  );

  return out;
}