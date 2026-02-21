import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function finnhubKey() {
  const k = process.env.FINNHUB_API_KEY;
  if (!k) throw new Error("Missing FINNHUB_API_KEY");
  return k;
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = String(searchParams.get("symbol") || "").trim().toUpperCase();
  if (!symbol) return NextResponse.json({ error: "Missing symbol" }, { status: 400 });

  // last 7 days
  const to = new Date();
  const from = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

  try {
    const key = finnhubKey();
    const url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${ymd(from)}&to=${ymd(to)}&token=${key}`;
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json().catch(() => null);

    if (!res.ok) return NextResponse.json({ error: "News fetch failed" }, { status: 500 });
    if (!Array.isArray(json)) return NextResponse.json({ items: [] }, { status: 200 });

    const items = json
      .filter((x: any) => x?.headline && x?.url)
      .slice(0, 20)
      .map((x: any) => ({
        headline: String(x.headline),
        url: String(x.url),
        source: x.source ? String(x.source) : null,
        datetime: Number(x.datetime ?? 0) || null,
        summary: x.summary ? String(x.summary).slice(0, 220) : null,
      }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "News failed" }, { status: 500 });
  }
}