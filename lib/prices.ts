// lib/prices.ts
export async function getLiveQuotes(symbols: string[]) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Missing FINNHUB_API_KEY");

  const out: Record<string, number> = {};
  const uniq = Array.from(new Set(symbols.map((s) => String(s).toUpperCase().trim()).filter(Boolean)));

  await Promise.all(
    uniq.map(async (sym) => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${encodeURIComponent(key)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        out[sym] = 0;
        return;
      }
      const j: any = await res.json().catch(() => null);
      const price = Number(j?.c ?? 0);
      out[sym] = Number.isFinite(price) ? price : 0;
    })
  );

  return out;
}