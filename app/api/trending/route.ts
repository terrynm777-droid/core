import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CANDIDATES = [
  "NVDA","AAPL","MSFT","AMZN","META","GOOGL","TSLA","AVGO","AMD","NFLX",
  "QQQ","PLTR","SMCI","ARM","MU","INTC","ADBE","CSCO","QCOM","PANW",
];

function pickRandom<T>(arr: T[], n: number) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

async function quote(symbol: string, key: string) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(key)}`;
  const r = await fetch(url, { cache: "no-store" });
  const j = await r.json();
  const price = Number(j?.c);
  const prev = Number(j?.pc);
  const pct = prev ? ((price - prev) / prev) * 100 : 0;
  if (!Number.isFinite(price) || price <= 0) throw new Error("bad quote");
  return { symbol, price, pct };
}

export async function GET() {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Missing FINNHUB_API_KEY (set it to enable live trending)" },
      { status: 500 }
    );
  }

  const symbols = pickRandom(CANDIDATES, 4);
  const rows = await Promise.all(symbols.map((s) => quote(s, key)));
  return NextResponse.json({ rows });
}