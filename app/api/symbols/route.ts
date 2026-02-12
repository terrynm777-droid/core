import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) return NextResponse.json({ results: [] }, { status: 200 });

  const key = process.env.FINNHUB_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Missing FINNHUB_API_KEY" },
      { status: 500 }
    );
  }

  const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(
    q
  )}&token=${encodeURIComponent(key)}`;

  const r = await fetch(url, { cache: "no-store" });
  const json = await r.json().catch(() => null);

  if (!r.ok) {
    return NextResponse.json(
      { error: json?.error || "Symbol search failed" },
      { status: 500 }
    );
  }

  const results =
    (json?.result || [])
      .filter((x: any) => x?.symbol && x?.description)
      .slice(0, 12)
      .map((x: any) => ({
        symbol: x.symbol as string,
        description: x.description as string,
      })) ?? [];

  return NextResponse.json({ results }, { status: 200 });
}