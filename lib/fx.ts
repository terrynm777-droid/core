// app/lib/fx.ts
export type UsdBaseRatesResponse = {
  base: "USD";
  // currency -> USD per 1 unit of that currency
  rates: Record<string, number>;
};

// Returns map: currency -> USD per 1 unit of that currency
export async function getUsdBaseRates(currencies: string[]): Promise<UsdBaseRatesResponse> {
  const wanted = Array.from(
    new Set((currencies ?? []).map((c) => String(c || "").toUpperCase().trim()).filter(Boolean))
  );

  // Fetch USD base rates (USD -> XXX)
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`FX fetch failed: ${res.status}`);

  const json: any = await res.json().catch(() => null);
  const ratesUsdTo = (json?.rates ?? {}) as Record<string, number>;

  const toUsd: Record<string, number> = { USD: 1 };

  for (const c of wanted) {
    if (c === "USD") continue;

    const usdToC = Number(ratesUsdTo[c]); // 1 USD = X C
    if (!Number.isFinite(usdToC) || usdToC <= 0) continue;

    // 1 C = (1 / X) USD
    toUsd[c] = 1 / usdToC;
  }

  return { base: "USD", rates: toUsd };
}