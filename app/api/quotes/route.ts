import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") || "").trim().toUpperCase();
  if (!symbol) return NextResponse.json({ error: "Missing symbol" }, { status: 400 });

  const key = process.env.FINNHUB_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });

  // Finnhub quote: c=current, pc=prev close
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(key)}`;
  const r = await fetch(url, { cache: "no-store" });
  const j = await r.json();

  const price = Number(j?.c);
  const prev = Number(j?.pc);

  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "No quote (bad symbol or API limit)" }, { status: 404 });
  }

  const pct = prev ? ((price - prev) / prev) * 100 : 0;

  return NextResponse.json({ symbol, price, pct });
}