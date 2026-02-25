// app/api/portfolio/snapshot/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HoldingRow = {
  symbol: string | null;
  amount: number | string | null; // shares
  currency: string | null;
};

type SnapRow = {
  day: string;
  total_usd: number | null;
};

type Holding = {
  symbol: string;
  shares: number;
  currency: string;
};

function dayKeyUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}

function toUsdPerUnit(currency: string, raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const c = currency.toUpperCase();
  if (c === "USD") return 1;
  if (raw > 5) return 1 / raw;
  return raw;
}

async function getLiveQuotes(symbols: string[]) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Missing FINNHUB_API_KEY");

  const out: Record<string, number> = {};
  await Promise.all(
    symbols.map(async (sym) => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${encodeURIComponent(key)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        out[sym] = 0;
        return;
      }
      const j: any = await res.json().catch(() => null);
      const price = Number(j?.c ?? 0);
      out[sym] = Number.isFinite(price) ? price : 0;
    })
  );
  return out;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: uerr,
  } = await supabase.auth.getUser();

  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("day,total_usd")
    .eq("user_id", user.id)
    .order("day", { ascending: true })
    .limit(800)
    .returns<SnapRow[]>();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ points: data ?? [] }, { status: 200 });
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: uerr,
  } = await supabase.auth.getUser();

  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: portfolio, error: perr } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perr) return NextResponse.json({ error: perr.message }, { status: 500 });
  if (!portfolio?.id) return NextResponse.json({ error: "Portfolio missing" }, { status: 500 });

  const { data: rows, error: herr } = await supabase
    .from("portfolio_holdings")
    .select("symbol, amount, currency")
    .eq("portfolio_id", portfolio.id)
    .returns<HoldingRow[]>();

  if (herr) return NextResponse.json({ error: herr.message }, { status: 500 });

  const hs: Holding[] = (rows ?? [])
    .map((h) => ({
      symbol: String(h.symbol ?? "").toUpperCase().trim(),
      shares: Number(h.amount ?? 0),
      currency: String(h.currency ?? "USD").toUpperCase().trim(),
    }))
    .filter((h) => h.symbol && Number.isFinite(h.shares) && h.shares > 0);

  const day = dayKeyUTC(new Date());

  if (hs.length === 0) {
    // still upsert 0 so chart has a point if you want
    await supabase.from("portfolio_snapshots").upsert({ user_id: user.id, day, total_usd: 0 }, { onConflict: "user_id,day" });
    return NextResponse.json({ ok: true, totalUsd: 0 }, { status: 201 });
  }

  const symbols = Array.from(new Set(hs.map((h) => h.symbol)));
  const currencies = Array.from(new Set(hs.map((h) => h.currency)));

  const [quotes, fxRaw] = await Promise.all([getLiveQuotes(symbols), getUsdBaseRates(currencies)]);
  const fxRates: Record<string, number> = (fxRaw as any)?.rates ?? {};

  const totalUsd = hs.reduce((acc, h) => {
    const px = Number(quotes[h.symbol] ?? 0);
    const usdPerUnit = Number(fxRates[h.currency] ?? (h.currency === "USD" ? 1 : 0));
    if (!Number.isFinite(px) || px <= 0) return acc;
    if (!Number.isFinite(usdPerUnit) || usdPerUnit <= 0) return acc;
    return acc + h.shares * px * usdPerUnit;
  }, 0);

  const { error: upErr } = await supabase
    .from("portfolio_snapshots")
    .upsert({ user_id: user.id, day, total_usd: totalUsd }, { onConflict: "user_id,day" });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, totalUsd }, { status: 201 });
}
