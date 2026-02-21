import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function finnhubKey() {
  const k = process.env.FINNHUB_API_KEY;
  if (!k) throw new Error("Missing FINNHUB_API_KEY");
  return k;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = String(searchParams.get("symbol") || "").trim().toUpperCase();
  const range = String(searchParams.get("range") || "6m").toLowerCase();

  if (!symbol) return NextResponse.json({ error: "Missing symbol" }, { status: 400 });

  // ranges: 7d / 1m / 3m / 6m / 1y
  const now = Math.floor(Date.now() / 1000);
  const days =
    range === "7d" ? 7 :
    range === "1m" ? 31 :
    range === "3m" ? 92 :
    range === "1y" ? 365 : 183;

  const from = now - days * 24 * 60 * 60;

  try {
    const key = finnhubKey();
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${now}&token=${key}`;
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json().catch(() => null);

    if (!res.ok) return NextResponse.json({ error: json?.error || "Chart fetch failed" }, { status: 500 });

    // Finnhub candle: { c:[], t:[] , s:"ok" }
    if (!json || json.s !== "ok" || !Array.isArray(json.c) || !Array.isArray(json.t)) {
      return NextResponse.json({ points: [] }, { status: 200 });
    }

    const points = json.t.map((ts: number, i: number) => ({
      t: new Date(ts * 1000).toISOString().slice(0, 10),
      c: Number(json.c[i] ?? 0),
    }));

    return NextResponse.json({ points }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Chart failed" }, { status: 500 });
  }
}