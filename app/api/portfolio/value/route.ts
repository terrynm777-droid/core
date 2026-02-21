import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HoldingRow = {
  symbol: string | null;
  amount: number | string | null; // IMPORTANT: this is NOTIONAL value at previous close
  currency: string | null;
};

type Holding = {
  symbol: string;    // e.g. AAPL
  notional: number;  // yesterday value in its currency
  currency: string;  // e.g. USD, AUD
};

type FinnQuote = {
  c: number;   // current
  pc: number;  // previous close
};

function safeNum(x: unknown, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function safeStr(x: unknown, fallback = "") {
  const s = String(x ?? "").trim();
  return s ? s : fallback;
}

// returns USD per 1 unit of currency
function toUsdPerUnit(currency: string, raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const c = currency.toUpperCase();
  if (c === "USD") return 1;
  // if quote looks like JPY-per-USD, invert it
  if (raw > 5) return 1 / raw;
  return raw;
}

async function getFinnhubQuotes(symbols: string[]): Promise<Record<string, FinnQuote>> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Missing FINNHUB_API_KEY");

  const out: Record<string, FinnQuote> = {};

  await Promise.all(
    symbols.map(async (sym) => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${encodeURIComponent(key)}`;
      const res = await fetch(url, { cache: "no-store" });
      const j: any = await res.json().catch(() => null);

      out[sym] = {
        c: safeNum(j?.c, 0),
        pc: safeNum(j?.pc, 0),
      };
    })
  );

  return out;
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: portfolio, error: perr } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (perr || !portfolio?.id) return NextResponse.json({ error: "Portfolio missing" }, { status: 500 });

  const { data: rows, error: herr } = await supabase
    .from("portfolio_holdings")
    .select("symbol,amount,currency")
    .eq("portfolio_id", portfolio.id)
    .returns<HoldingRow[]>();

  if (herr) return NextResponse.json({ error: herr.message }, { status: 500 });

  const hs: Holding[] = (rows ?? [])
    .map((r: HoldingRow): Holding => ({
      symbol: safeStr(r.symbol).toUpperCase(),
      notional: safeNum(r.amount, 0),
      currency: safeStr(r.currency, "USD").toUpperCase(),
    }))
    .filter((h: Holding) => Boolean(h.symbol) && Number.isFinite(h.notional) && h.notional > 0);

  if (!hs.length) {
    return NextResponse.json({
      totalUsd: 0,
      dayChangeAmount: 0,
      dayChangePct: 0,
      positions: [],
    });
  }

  const symbols = Array.from(new Set(hs.map((h: Holding) => h.symbol)));
  const currencies = Array.from(new Set(hs.map((h: Holding) => h.currency)));

  const [quotes, fxRaw] = await Promise.all([
    getFinnhubQuotes(symbols),
    getUsdBaseRates(currencies),
  ]);

  const fxRates: Record<string, number> = (fxRaw as any)?.rates ?? {};

  type Position = {
    symbol: string;
    currency: string;
    prevClose: number;     // pc
    current: number;       // c
    prevValueUsd: number;  // yesterday notional in USD
    todayValueUsd: number; // today value in USD
    dayChangeUsd: number;  // delta in USD
  };

  const positions: Position[] = hs.map((h: Holding) => {
    const q = quotes[h.symbol] ?? { c: 0, pc: 0 };

    const rawFx = safeNum(fxRates[h.currency], h.currency === "USD" ? 1 : 0);
    const usdPerUnit = toUsdPerUnit(h.currency, rawFx);

    const prevValueUsd = h.notional * usdPerUnit;

    // If Finnhub missing pc, treat no move (avoid division by 0)
    const ratio = q.pc > 0 ? q.c / q.pc : 1;

    const todayNotional = h.notional * ratio;
    const todayValueUsd = todayNotional * usdPerUnit;

    return {
      symbol: h.symbol,
      currency: h.currency,
      prevClose: q.pc,
      current: q.c,
      prevValueUsd,
      todayValueUsd,
      dayChangeUsd: todayValueUsd - prevValueUsd,
    };
  });

  const prevTotal = positions.reduce((a, p) => a + p.prevValueUsd, 0);
  const todayTotal = positions.reduce((a, p) => a + p.todayValueUsd, 0);

  const diff = todayTotal - prevTotal;
  const pct = prevTotal > 0 ? (diff / prevTotal) * 100 : 0;

  return NextResponse.json({
    totalUsd: todayTotal,
    dayChangeAmount: diff,
    dayChangePct: pct,
    positions,
  });
}