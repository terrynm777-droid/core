const FINNHUB_KEY = process.env.FINNHUB_API_KEY!;

export async function getLivePrices(symbols: string[]) {
  const out: Record<string, number> = {};

  await Promise.all(
    symbols.map(async (s) => {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${s}&token=${FINNHUB_KEY}`,
          { cache: "no-store" }
        );

        const j = await res.json();
        if (j?.c) out[s] = Number(j.c);
      } catch {}
    })
  );

  return out;
}