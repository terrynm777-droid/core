export async function finnhubQuote(symbol: string) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Missing FINNHUB_API_KEY");

  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
    symbol
  )}&token=${encodeURIComponent(key)}`;

  const res = await fetch(url, { cache: "no-store" });
  const json: any = await res.json().catch(() => null);

  if (!res.ok) throw new Error(json?.error || `Finnhub quote error (${res.status})`);

  // Finnhub quote fields: c=current, d=change, dp=percent, h/l/o/pc...
  return {
    current: Number(json?.c ?? 0),
    change: Number(json?.d ?? 0),
    changePct: Number(json?.dp ?? 0),
    prevClose: Number(json?.pc ?? 0),
  };
}