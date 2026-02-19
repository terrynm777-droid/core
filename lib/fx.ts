// app/lib/fx.ts
export type UsdBaseRatesResponse = {
  base: "USD";
  // USD -> XXX rates
  rates: Record<string, number>;
};

// Returns map: currency -> USD per 1 unit of that currency
export async function getUsdBaseRates(currencies: string[]) {
  const wanted = Array.from(new Set((currencies ?? []).map((c) => String(c || "").toUpperCase())));

  // Fetch USD base rates (USD -> XXX)
  const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
  if (!res.ok) throw new Error(`FX fetch failed: ${res.status}`);
  const json = (await res.json()) as any;

  const ratesUsdTo = (json?.rates ?? {}) as Record<string, number>;

  const toUsd: Record<string, number> = { USD: 1 };

  for (const c of wanted) {
    if (c === "USD") continue;

    const usdToC = Number(ratesUsdTo[c]); // 1 USD = X C
    if (!Number.isFinite(usdToC) || usdToC <= 0) continue;

    // 1 C = (1 / X) USD
    toUsd[c] = 1 / usdToC;
  }

  return { base: "USD" as const, rates: toUsd };
}