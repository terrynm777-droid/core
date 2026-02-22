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
  const q = String(searchParams.get("q") || "").trim();

  if (!q) return NextResponse.json({ results: [] }, { status: 200 });

  try {
    const key = finnhubKey();
    const url =
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}` +
      `&token=${encodeURIComponent(key)}`;

    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json().catch(() => null);

    // Non-fatal provider limitations
    if (res.status === 401 || res.status === 403 || res.status === 429) {
      return NextResponse.json(
        {
          results: [],
          blocked: true,
          status: res.status,
          reason: json?.error || "Search unavailable (provider access/rate limit).",
        },
        { status: 200 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error || `Search failed (${res.status})` },
        { status: 500 }
      );
    }

    const arr = Array.isArray(json?.result) ? json.result : [];

    // normalize
    const results = arr.slice(0, 10).map((x: any) => ({
      symbol: String(x?.symbol || x?.displaySymbol || "").trim(),
      name: String(x?.description || "").trim(),
      type: String(x?.type || "stock").trim(),
      exchange: null,
      currency: null,
      source: "finnhub",
    })).filter((r: any) => r.symbol);

    return NextResponse.json({ results }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Search failed" },
      { status: 500 }
    );
  }
}