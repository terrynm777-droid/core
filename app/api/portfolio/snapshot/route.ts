// app/api/portfolio/snapshot/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Return actual stored points only (no synthetic zeros)
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("day, total_usd")
    .eq("user_id", user.id)
    .order("day", { ascending: true })
    .limit(800);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const points = (data ?? [])
    .map((r: any) => ({
      day: String(r.day),
      total_usd: r.total_usd == null ? null : Number(r.total_usd),
    }))
    .filter((p) => p.day && p.day.length >= 10);

  return NextResponse.json({ points }, { status: 200 });
}

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: portfolio, error: perr } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perr) return NextResponse.json({ error: perr.message }, { status: 500 });
  if (!portfolio?.id) return NextResponse.json({ error: "Portfolio missing" }, { status: 500 });

  const { data: holdings, error: herr } = await supabase
    .from("portfolio_holdings")
    .select("amount, currency")
    .eq("portfolio_id", portfolio.id);

  if (herr) return NextResponse.json({ error: herr.message }, { status: 500 });

  const hs = (holdings ?? [])
    .map((h: any) => ({
      amount: Number(h.amount ?? 0),
      currency: String(h.currency ?? "USD").toUpperCase(),
    }))
    .filter((h: any) => Number.isFinite(h.amount) && h.amount > 0);

  const currencies = Array.from(new Set(hs.map((h: any) => h.currency)));
  const fx = await getUsdBaseRates(currencies);

  const total_usd = hs.reduce((acc: number, h: any) => {
    const raw = Number((fx as any)?.rates?.[h.currency] ?? (h.currency === "USD" ? 1 : 0));
    const usdPerUnit = toUsdPerUnit(h.currency, raw);
    return acc + (usdPerUnit > 0 ? h.amount * usdPerUnit : 0);
  }, 0);

  const day = dayKeyUTC(new Date());

  // Requires UNIQUE(user_id, day)
  const { data: up, error: uperr } = await supabase
    .from("portfolio_snapshots")
    .upsert({ user_id: user.id, day, total_usd }, { onConflict: "user_id,day" })
    .select("day, total_usd")
    .single();

  if (uperr) return NextResponse.json({ error: uperr.message }, { status: 500 });

  return NextResponse.json({ snapshot: up }, { status: 201 });
}