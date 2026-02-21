import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function finnhubKey() {
  const k = process.env.FINNHUB_API_KEY;
  if (!k) throw new Error("Missing FINNHUB_API_KEY");
  return k;
}

function toDays(range: string) {
  switch (range) {
    case "7d":
      return 7;
    case "1m":
      return 31;
    case "3m":
      return 92;
    case "6m":
      return 183;
    case "1y":
      return 365;
    default:
      return 7;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = String(searchParams.get("symbol") || "")
    .trim()
    .toUpperCase();
  const range = String(searchParams.get("range") || "7d").toLowerCase();

  if (!symbol) return NextResponse.json({ error: "Missing symbol" }, { status: 400 });

  const now = Math.floor(Date.now() / 1000);
  const days = toDays(range);
  const from = now - days * 24 * 60 * 60;

  try {
    const key = finnhubKey();
    const url =
      `https://finnhub.io/api/v1/stock/candle` +
      `?symbol=${encodeURIComponent(symbol)}` +
      `&resolution=D&from=${from}&to=${now}&token=${encodeURIComponent(key)}`;

    const res = await fetch(url, { cache: "no-store" });

    // IMPORTANT: Finnhub often returns 403/401/429 for candle access depending on plan / rate limits.
    // Treat those as "chart unavailable" (non-fatal) so UI still works.
    if (res.status === 401 || res.status === 403 || res.status === 429) {
      const body = await res.json().catch(() => null);
      return NextResponse.json(
        {
          points: [],
          blocked: true,
          status: res.status,
          reason: body?.error || "Chart unavailable (provider access/rate limit)",
        },
        { status: 200 }
      );
    }

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error || `Chart fetch failed (${res.status})` },
        { status: 500 }
      );
    }

    // Finnhub candle: { c:[], t:[], s:"ok" } or s:"no_data"
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