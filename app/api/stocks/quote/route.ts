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
    const msg = String(e?.message || "Quote failed");

    // If your lib throws messages that include status, treat access/rate-limit as non-fatal.
    const looksBlocked =
      msg.includes("401") || msg.includes("403") || msg.includes("429") || msg.toLowerCase().includes("rate");

    if (looksBlocked) {
      return NextResponse.json(
        { quote: null, blocked: true, reason: msg },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}