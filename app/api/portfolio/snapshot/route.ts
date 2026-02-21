// app/api/portfolio/snapshot/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";
import { getLivePrices } from "@/lib/prices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HoldingRow = {
  symbol: string;
  amount: number | null;   // shares
  currency: string | null; // currency of the quoted price
};

function dayKeyUTC(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

// returns USD per 1 unit of currency
function toUsdPerUnit(currency: string, raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const c = currency.toUpperCase();
  if (c === "USD") return 1;
  if (raw > 5) return 1 / raw;
  return raw;
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
    .order("day", { ascending: true });

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

  const { data: holdings, error: herr } = await supabase
    .from("portfolio_holdings")
    .select("symbol,amount,currency")
    .eq("portfolio_id", portfolio.id)
    .returns<HoldingRow[]>();

  if (herr) return NextResponse.json({ error: herr.message }, { status: 500 });

  const hs = (holdings ?? [])
    .map((h) => ({
      symbol: String(h.symbol ?? "").trim().toUpperCase(),
      amount: Number(h.amount ?? 0),
      currency: String(h.currency ?? "USD").trim().toUpperCase(),
    }))
    .filter((h) => h.symbol && Number.isFinite(h.amount) && h.amount > 0);

  if (hs.length === 0) {
    return NextResponse.json({ ok: true, totalUsd: 0 }, { status: 200 });
  }

  // 1) live prices (in each holding's quote currency)
  const symbols = Array.from(new Set(hs.map((h) => h.symbol)));
  const prices = await getLivePrices(symbols); // Record<symbol, lastPrice>

  // 2) FX rates to convert holding currency -> USD
  const currencies = Array.from(new Set(hs.map((h) => h.currency)));
  const fx = await getUsdBaseRates(currencies);
  const fxRates: Record<string, number> =
    fx && typeof (fx as any).rates === "object" ? (fx as any).rates : {};

  // 3) value holdings
  let totalUsd = 0;

  for (const h of hs) {
    const px = Number(prices[h.symbol] ?? 0);
    if (!Number.isFinite(px) || px <= 0) continue;

    const rawFx = Number(fxRates[h.currency] ?? (h.currency === "USD" ? 1 : 0));
    const usdPerUnit = toUsdPerUnit(h.currency, rawFx);
    if (usdPerUnit <= 0) continue;

    totalUsd += h.amount * px * usdPerUnit;
  }

  const day = dayKeyUTC();

  const { error: upErr } = await supabase
    .from("portfolio_snapshots")
    .upsert({ user_id: user.id, day, total_usd: totalUsd }, { onConflict: "user_id,day" });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, totalUsd }, { status: 201 });
}