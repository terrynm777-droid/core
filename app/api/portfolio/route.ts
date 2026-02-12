import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normCurrency(c: any) {
  const v = String(c || "USD").toUpperCase().trim();
  const allowed = new Set(["USD","JPY","AUD","HKD","EUR","GBP","CNY","CAD","CHF","SGD"]);
  return allowed.has(v) ? v : "USD";
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // ensure portfolio exists
  let { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, user_id, name, is_public")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!portfolio) {
    const ins = await supabase
      .from("portfolios")
      .insert({ user_id: user.id, name: "My Portfolio", is_public: false })
      .select("id, user_id, name, is_public")
      .single();

    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
    portfolio = ins.data;
  }

  const { data: holdings, error } = await supabase
    .from("portfolio_holdings")
    .select("id, symbol, amount, currency")
    .eq("portfolio_id", portfolio.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ portfolio, holdings: holdings ?? [] }, { status: 200 });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as any;
  const name = String(body?.name ?? "My Portfolio").slice(0, 60);
  const is_public = Boolean(body?.is_public);

  // ensure exists then update
  const { data: port, error: perr } = await supabase
    .from("portfolios")
    .upsert({ user_id: user.id, name, is_public }, { onConflict: "user_id" })
    .select("id, user_id, name, is_public")
    .single();

  if (perr) return NextResponse.json({ error: perr.message }, { status: 500 });
  return NextResponse.json({ portfolio: port }, { status: 200 });
}

// Replace-all holdings
export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as any;
  const rows = Array.isArray(body?.holdings) ? body.holdings : null;
  if (!rows) return NextResponse.json({ error: "holdings array required" }, { status: 400 });

  const { data: portfolio, error: perr } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perr) return NextResponse.json({ error: perr.message }, { status: 500 });
  if (!portfolio) return NextResponse.json({ error: "Portfolio missing" }, { status: 500 });

  // delete then insert
  const del = await supabase.from("portfolio_holdings").delete().eq("portfolio_id", portfolio.id);
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });

  const clean = rows
    .map((r: any) => ({
      portfolio_id: portfolio.id,
      symbol: String(r.symbol || "").trim().toUpperCase(),
      amount: Number(r.amount ?? 0),
      currency: normCurrency(r.currency),
    }))
    .filter((r: any) => r.symbol && isFinite(r.amount) && r.amount > 0);

  if (clean.length === 0) {
    return NextResponse.json({ ok: true, holdings: [] }, { status: 200 });
  }

  const ins = await supabase
    .from("portfolio_holdings")
    .insert(clean)
    .select("id, symbol, amount, currency");

  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });

  return NextResponse.json({ ok: true, holdings: ins.data ?? [] }, { status: 200 });
}