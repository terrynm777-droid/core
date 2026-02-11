import { NextResponse } from "next/server";

const TICKERS = ["AAPL", "NVDA", "TSLA", "MSFT"];

export async function GET() {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });
  }

  const results = await Promise.all(
    TICKERS.map(async (symbol) => {
      const r = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`,
        { cache: "no-store" }
      );
      const q = await r.json(); // { c, d, dp, ... }
      return { symbol, price: q.c, change: q.d, pct: q.dp };
    })
  );

  return NextResponse.json({ results }, { headers: { "cache-control": "no-store" } });
}