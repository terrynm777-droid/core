import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUsdBaseRates } from "@/lib/fx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HoldingRow = {
  user_id: string;
  symbol: string | null;
  amount: number | string | null;
  currency: string | null;
};

function dayKeyUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function getLiveQuotes(symbols: string[]) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Missing FINNHUB_API_KEY");

  const out: Record<string, number> = {};

  await Promise.all(
    symbols.map(async (sym) => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${encodeURIComponent(key)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return (out[sym] = 0);

      const j: any = await res.json().catch(() => null);
      const price = Number(j?.c ?? 0);
      out[sym] = Number.isFinite(price) ? price : 0;
    })
  );

  return out;
}

export async function GET(req: Request) {
  // ✅ CRON AUTH
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !service) {
    return NextResponse.json(
      { error: "Missing Supabase service config" },
      { status: 500 }
    );
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: holdings, error } = await admin
    .from("portfolio_holdings")
    .select("symbol,amount,currency, portfolios!inner(user_id)")
    .returns<any[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows: HoldingRow[] = (holdings ?? [])
    .map((r) => ({
      user_id: String(r?.portfolios?.user_id ?? ""),
      symbol: r?.symbol ?? null,
      amount: r?.amount ?? null,
      currency: r?.currency ?? null,
    }))
    .filter((r) => r.user_id);

  const day = dayKeyUTC(new Date());

  if (!rows.length) {
    return NextResponse.json({ ok: true, day, processedUsers: 0 });
  }

  // ✅ GROUP BY USER
  const byUser = new Map<
    string,
    { symbol: string; shares: number; currency: string }[]
  >();

  for (const r of rows) {
    const sym = String(r.symbol ?? "").toUpperCase().trim();
    const shares = Number(r.amount ?? 0);
    const cur = String(r.currency ?? "USD").toUpperCase().trim();

    if (!sym || !Number.isFinite(shares) || shares <= 0) continue;

    const arr = byUser.get(r.user_id) ?? [];
    arr.push({ symbol: sym, shares, currency: cur });
    byUser.set(r.user_id, arr);
  }

  const allSymbols = Array.from(
    new Set(Array.from(byUser.values()).flat().map((h) => h.symbol))
  );

  const allCurrencies = Array.from(
    new Set(Array.from(byUser.values()).flat().map((h) => h.currency))
  );

  const [quotes, fx] = await Promise.all([
    getLiveQuotes(allSymbols),
    getUsdBaseRates(allCurrencies),
  ]);

  const usdPerUnit: Record<string, number> = fx?.rates ?? {};

  const upserts: { user_id: string; day: string; total_usd: number }[] = [];

  for (const [userId, hs] of byUser.entries()) {
    let totalUsd = 0;

    for (const h of hs) {
      const px = Number(quotes[h.symbol] ?? 0);
      const fxRate = Number(
        usdPerUnit[h.currency] ?? (h.currency === "USD" ? 1 : 0)
      );

      if (!Number.isFinite(px) || px <= 0) continue;
      if (!Number.isFinite(fxRate) || fxRate <= 0) continue;

      totalUsd += h.shares * px * fxRate;
    }

    upserts.push({ user_id: userId, day, total_usd: totalUsd });
  }

  const { error: upErr } = await admin
    .from("portfolio_snapshots")
    .upsert(upserts, { onConflict: "user_id,day" });

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    day,
    processedUsers: upserts.length,
  });
}