import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SnapRow = {
  day: string;
  total_usd: number | null;
};

function dayKeyUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}

function toUsdPerUnit(currency: string, raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  if (currency === "USD") return 1;
  if (raw > 5) return 1 / raw;
  return raw;
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: holdings } = await supabase
    .from("portfolio_holdings")
    .select("amount,currency")
    .eq("portfolio_id", portfolio!.id);

  const currencies = [...new Set((holdings ?? []).map((h: any) => String(h.currency ?? "USD").toUpperCase()))];

const fx = await getUsdBaseRates(currencies);

const total_usd = (holdings ?? []).reduce((acc: number, h: any) => {
  const raw = Number((fx as any)?.rates?.[String(h.currency ?? "USD").toUpperCase()] ?? 1);
  const usdPerUnit = toUsdPerUnit(String(h.currency ?? "USD").toUpperCase(), raw);
  return acc + Number(h.amount ?? 0) * usdPerUnit;
}, 0);
  const day = dayKeyUTC(new Date());

  await supabase
    .from("portfolio_snapshots")
    .upsert(
      { user_id: user.id, day, total_usd },
      { onConflict: "user_id,day" }
    );

  return NextResponse.json({ ok: true });
}