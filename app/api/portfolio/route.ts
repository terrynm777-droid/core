import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type HoldingInput = {
  symbol: string;
  weight: number;
  notes?: string | null;
};

async function getOrCreatePortfolioId(supabase: any, userId: string) {
  const { data: existing, error: selErr } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing?.id) return existing.id as string;

  const { data: created, error: insErr } = await supabase
    .from("portfolios")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (insErr) throw insErr;
  return created.id as string;
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

  try {
    const portfolioId = await getOrCreatePortfolioId(supabase, user.id);

    const { data: portfolio, error: pErr } = await supabase
      .from("portfolios")
      .select("id, name, is_public, updated_at, created_at")
      .eq("id", portfolioId)
      .single();

    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

    const { data: holdings, error: hErr } = await supabase
      .from("holdings")
      .select("id, symbol, weight, notes, updated_at, created_at")
      .eq("portfolio_id", portfolioId)
      .order("weight", { ascending: false });

    if (hErr) return NextResponse.json({ error: hErr.message }, { status: 500 });

    return NextResponse.json(
      { portfolio, holdings: holdings ?? [] },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { name?: string; is_public?: boolean }
    | null;

  const name =
    typeof body?.name === "string" ? body!.name.trim().slice(0, 50) : undefined;
  const is_public =
    typeof body?.is_public === "boolean" ? body!.is_public : undefined;

  try {
    const portfolioId = await getOrCreatePortfolioId(supabase, user.id);

    const payload: any = {};
    if (name !== undefined && name.length > 0) payload.name = name;
    if (is_public !== undefined) payload.is_public = is_public;

    const { data, error } = await supabase
      .from("portfolios")
      .update(payload)
      .eq("id", portfolioId)
      .select("id, name, is_public, updated_at, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ portfolio: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { holdings?: HoldingInput[] }
    | null;

  const holdings = Array.isArray(body?.holdings) ? body!.holdings! : null;
  if (!holdings) {
    return NextResponse.json({ error: "holdings is required" }, { status: 400 });
  }

  // validate
  const cleaned: HoldingInput[] = [];
  for (const h of holdings) {
    const symbol = String(h?.symbol || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
    const weight = Number(h?.weight);
    const notes =
      h?.notes === undefined ? null : String(h.notes ?? "").slice(0, 200);

    if (!symbol) continue;
    if (!Number.isFinite(weight) || weight < 0 || weight > 100) {
      return NextResponse.json(
        { error: `Invalid weight for ${symbol}` },
        { status: 400 }
      );
    }
    cleaned.push({ symbol, weight, notes });
  }

  // optional: enforce sum <= 100 (you can change to === 100 later)
  const sum = cleaned.reduce((acc, x) => acc + x.weight, 0);
  if (sum > 100.0001) {
    return NextResponse.json(
      { error: `Total weight exceeds 100% (got ${sum.toFixed(2)}%)` },
      { status: 400 }
    );
  }

  try {
    const portfolioId = await getOrCreatePortfolioId(supabase, user.id);

    // replace-all strategy
    const { error: delErr } = await supabase
      .from("holdings")
      .delete()
      .eq("portfolio_id", portfolioId);

    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

    if (cleaned.length > 0) {
      const rows = cleaned.map((h) => ({
        portfolio_id: portfolioId,
        symbol: h.symbol,
        weight: h.weight,
        notes: h.notes ?? null,
      }));

      const { error: insErr } = await supabase.from("holdings").insert(rows);
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed" },
      { status: 500 }
    );
  }
}