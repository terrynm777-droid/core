import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { finnhubQuote } from "@/lib/finnhub";
import { getUsdBaseRates } from "@/lib/fx";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, name, is_public")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!portfolio) return NextResponse.json({ holdings: [], pie: [], total_usd: 0, dayChangeAmount: 0, dayChangePct: 0 }, { status: 200 });

  const { data: holdings, error } = await supabase
    .from("portfolio_holdings")
    .select("symbol, amount, currency")
    .eq("portfolio_id", portfolio.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hs = (holdings ?? []).map(h => ({
    symbol: String(h.symbol || "").toUpperCase(),
    amount: Number(h.amount ?? 0),
    currency: String(h.currency || "USD").toUpperCase(),
  })).filter(h => h.symbol && h.amount > 0);

  if (hs.length === 0) {
    return NextResponse.json({ holdings: [], pie: [], total_usd: 0, dayChangeAmount: 0, dayChangePct: 0 }, { status: 200 });
  }

  const currencies = Array.from(new Set(hs.map(h => h.currency)));
  const fx = await getUsdBaseRates(currencies);

  const quotes = await Promise.all(
    hs.map(async (h) => {
      try {
        const q = await finnhubQuote(h.symbol);
        return { symbol: h.symbol, ok: true, ...q };
      } catch (e: any) {
        return { symbol: h.symbol, ok: false, current: 0, change: 0, changePct: 0, prevClose: 0 };
      }
    })
  );

  const usdAmount = (h: { amount: number; currency: string }) => {
    const r = h.currency === "USD" ? 1 : Number(fx?.rates?.[h.currency] ?? 0);
    if (!Number.isFinite(r) || r <= 0) return 0;
    return h.amount * r;
  };

  const total_usd = hs.reduce((acc, h) => acc + usdAmount(h), 0);

  const pie = hs.map((h) => {
    const u = usdAmount(h);
    return {
      symbol: h.symbol,
      amount: h.amount,
      currency: h.currency,
      usd: u,
      weight: total_usd > 0 ? (u / total_usd) : 0,
      quote: quotes.find(q => q.symbol === h.symbol) ?? null,
    };
  });

  const dayChangePct = pie.reduce((acc, p) => {
    const dp = Number(p.quote?.changePct ?? 0);
    return acc + (p.weight * dp);
  }, 0);

  const dayChangeAmount = total_usd * (dayChangePct / 100);

  return NextResponse.json({ holdings: hs, pie, total_usd, dayChangeAmount, dayChangePct }, { status: 200 });
}