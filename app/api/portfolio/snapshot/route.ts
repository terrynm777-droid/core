// app/api/portfolio/snapshot/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";
import { getQuotes } from "@/lib/prices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SnapRow = { day: string; total_usd: number | null };

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

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("day,total_usd")
    .eq("user_id", user.id)
    .order("day", { ascending: true })
    .returns<SnapRow[]>();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ points: data ?? [] });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
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
    .select("symbol, amount, currency")
    .eq("portfolio_id", portfolio.id);

  if (herr) return NextResponse.json({ error: herr.message }, { status: 500 });

  const hs = (holdings ?? [])
    .map((h: any) => ({
      symbol: String(h.symbol ?? "").toUpperCase(),
      shares: Number(h.amount ?? 0),
      currency: String(h.currency ?? "USD").toUpperCase(),
    }))
    .filter((h: any) => h.symbol && Number.isFinite(h.shares) && h.shares > 0);

  if (hs.length === 0) {
    const day = dayKeyUTC(new Date());
    await supabase.from("portfolio_snapshots").upsert(
      { user_id: user.id, day, total_usd: 0 },
      { onConflict: "user_id,day" }
    );
    return NextResponse.json({ ok: true, totalUsd: 0 });
  }

  const quotes = await getQuotes(hs.map((h) => h.symbol));

  const currencies = Array.from(new Set(hs.map((h) => h.currency)));
  const fx = await getUsdBaseRates(currencies);
  const rates = (fx as any)?.rates ?? {};

  const totalUsd = hs.reduce((acc, h) => {
    const px = Number(quotes[h.symbol]?.price ?? 0);
    if (!Number.isFinite(px) || px <= 0) return acc;

    const rawFx = Number(rates[h.currency] ?? (h.currency === "USD" ? 1 : 0));
    const usdPerUnit = toUsdPerUnit(h.currency, rawFx);
    if (usdPerUnit <= 0) return acc;

    return acc + h.shares * px * usdPerUnit;
  }, 0);

  const day = dayKeyUTC(new Date());

  const { error: upErr } = await supabase
    .from("portfolio_snapshots")
    .upsert({ user_id: user.id, day, total_usd: totalUsd }, { onConflict: "user_id,day" });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, totalUsd });
}