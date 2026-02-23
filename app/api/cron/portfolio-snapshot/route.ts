import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUsdBaseRates } from "@/lib/fx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HoldingRow = {
  user_id: string;
  symbol: string | null;
  amount: number | string | null; // shares
  currency: string | null;
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

export async function GET(req: Request) {
  // Auth guard for cron
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  
  if (secret !== process.env.CRON_SECRET) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return NextResponse.json({ error: "Missing Supabase service config" }, { status: 500 });
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Pull all holdings joined to portfolios to get user_id.
  // Adjust join if your schema differs.
  const { data: holdings, error } = await admin
    .from("portfolio_holdings")
    .select("symbol,amount,currency, portfolios!inner(user_id)")
    .returns<any[]>();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows: HoldingRow[] = (holdings ?? []).map((r) => ({
    user_id: String(r.portfolios?.user_id ?? ""),
    symbol: r.symbol,
    amount: r.amount,
    currency: r.currency,
  })).filter((r) => r.user_id);

  const day = dayKeyUTC(new Date());

  if (!rows.length) {
    return NextResponse.json({ ok: true, day, processedUsers: 0 }, { status: 200 });
  }

  // Group by user
  const byUser = new Map<string, { symbol: string; shares: number; currency: string }[]>();
  for (const r of rows) {
    const sym = String(r.symbol ?? "").toUpperCase().trim();
    const shares = Number(r.amount ?? 0);
    const cur = String(r.currency ?? "USD").toUpperCase().trim();
    if (!sym || !Number.isFinite(shares) || shares <= 0) continue;

    const arr = byUser.get(r.user_id) ?? [];
    arr.push({ symbol: sym, shares, currency: cur });
    byUser.set(r.user_id, arr);
  }

  const allSymbols = Array.from(new Set(Array.from(byUser.values()).flat().map((h) => h.symbol)));
  const allCurrencies = Array.from(new Set(Array.from(byUser.values()).flat().map((h) => h.currency)));

  const [quotes, fxRaw] = await Promise.all([getLiveQuotes(allSymbols), getUsdBaseRates(allCurrencies)]);
  const fxRates: Record<string, number> = (fxRaw as any)?.rates ?? {};

  const upserts: { user_id: string; day: string; total_usd: number }[] = [];

  for (const [userId, hs] of byUser.entries()) {
    const totalUsd = hs.reduce((acc, h) => {
      const px = Number(quotes[h.symbol] ?? 0);
      const rawFx = Number(fxRates[h.currency] ?? (h.currency === "USD" ? 1 : 0));
      const usdPerUnit = toUsdPerUnit(h.currency, rawFx);
      if (!Number.isFinite(px) || px <= 0) return acc;
      if (!Number.isFinite(usdPerUnit) || usdPerUnit <= 0) return acc;
      return acc + h.shares * px * usdPerUnit;
    }, 0);

    upserts.push({ user_id: userId, day, total_usd: totalUsd });
  }

  const { error: upErr } = await admin
    .from("portfolio_snapshots")
    .upsert(upserts, { onConflict: "user_id,day" });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, day, processedUsers: upserts.length }, { status: 200 });
}