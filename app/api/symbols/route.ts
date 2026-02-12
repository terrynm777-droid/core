import { NextResponse } from "next/server";

type Result = {
  symbol: string;
  name: string;
  type: "stock" | "etf" | "forex" | "crypto" | "index" | "fund" | "unknown";
  exchange?: string | null;
  currency?: string | null;
  source: "finnhub";
};

function inferType(row: any): Result["type"] {
  // Finnhub symbol search returns rows like:
  // { description, displaySymbol, symbol, type }
  const t = String(row?.type || "").toLowerCase();
  if (!t) return "unknown";
  if (t.includes("crypto")) return "crypto";
  if (t.includes("forex") || t.includes("fx")) return "forex";
  if (t.includes("etf")) return "etf";
  if (t.includes("index")) return "index";
  if (t.includes("fund")) return "fund";
  if (t.includes("stock") || t.includes("equity")) return "stock";
  return "unknown";
}

async function finnhubSymbolSearch(q: string): Promise<Result[]> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Missing FINNHUB_API_KEY env var.");

  // Finnhub: /api/v1/search?q=...
  const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${encodeURIComponent(
    key
  )}`;

  const res = await fetch(url, { cache: "no-store" });
  const json: any = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.error || `Finnhub error (${res.status})`);
  }

  const rows = Array.isArray(json?.result) ? json.result : [];

  return rows.slice(0, 20).map((r: any) => ({
    symbol: String(r.symbol ?? r.displaySymbol ?? ""),
    name: String(r.description ?? ""),
    type: inferType(r),
    exchange: null, // Finnhub search doesn't reliably provide exchange in this endpoint
    currency: null, // currency not returned here; set later when you fetch quote/profile
    source: "finnhub",
  }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) return NextResponse.json({ results: [] }, { status: 200 });

  try {
    const results = await finnhubSymbolSearch(q);
    return NextResponse.json({ results }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Symbol search failed" },
      { status: 500 }
    );
  }
}