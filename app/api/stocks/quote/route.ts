import { NextResponse } from "next/server";
import { finnhubQuote } from "@/lib/finnhub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = String(searchParams.get("symbol") || "").trim().toUpperCase();
  if (!symbol) return NextResponse.json({ error: "Missing symbol" }, { status: 400 });

  try {
    const q = await finnhubQuote(symbol);
    return NextResponse.json(
      {
        quote: {
          symbol,
          current: Number(q.current ?? 0),
          prevClose: Number(q.prevClose ?? 0),
          change: Number(q.change ?? 0),
          changePct: Number(q.changePct ?? 0),
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Quote failed" }, { status: 500 });
  }
}