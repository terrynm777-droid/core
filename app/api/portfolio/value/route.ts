import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { finnhubQuote } from "@/lib/finnhub";

// for now: assume holdings currency is informational.
// to convert currencies properly you need FX rates; we’ll keep it simple:
// treat amounts as “allocation weights” and price-based performance uses % changes.
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, name, is_public")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!portfolio) return NextResponse.json({ error: "No portfolio" }, { status: 200 });

  const { data: holdings, error } = await supabase
    .from("portfolio_holdings")
    .select("symbol, amount, currency")
    .eq("portfolio_id", portfolio.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hs = (holdings ?? []).map(h => ({
    symbol: String(h.symbol || "").toUpperCase(),
    amount: Number(h.amount ?? 0),
    currency: String(h.currency || "USD"),
  })).filter(h => h.symbol && h.amount > 0);

  if (hs.length === 0) {
    return NextResponse.json({ holdings: [], pie: [], totalAmount: 0, dayChangeAmount: 0, dayChangePct: 0 }, { status: 200 });
  }

  // Fetch quotes
  const quotes = await Promise.all(
    hs.map(async (h) => {
      try {
        const q = await finnhubQuote(h.symbol);
        return { symbol: h.symbol, ok: true, ...q };
      } catch (e: any) {
        return { symbol: h.symbol, ok: false, current: 0, change: 0, changePct: 0, prevClose: 0, error: e?.message || "quote failed" };
      }
    })
  );

  // PIE weights by “amount allocation”
  const totalAmount = hs.reduce((a, h) => a + h.amount, 0);
  const pie = hs.map((h) => ({
    symbol: h.symbol,
    amount: h.amount,
    currency: h.currency,
    weight: totalAmount > 0 ? (h.amount / totalAmount) : 0,
    quote: quotes.find(q => q.symbol === h.symbol) ?? null,
  }));

  // “Daily performance” approximation: weighted average using quote % move
  // (true PnL requires FX conversion + shares; you’re not collecting shares)
  const dayChangePct = pie.reduce((acc, p) => {
    const dp = Number(p.quote?.changePct ?? 0);
    return acc + (p.weight * dp);
  }, 0);

  const dayChangeAmount = totalAmount * (dayChangePct / 100);

  return NextResponse.json({ holdings: hs, pie, totalAmount, dayChangeAmount, dayChangePct }, { status: 200 });
}