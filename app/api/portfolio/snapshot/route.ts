import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Force Node runtime (Supabase server client expects Node APIs)
export const runtime = "nodejs";

type SnapshotRow = {
  id: string;
  created_at: string;
  user_id: string;
  total_value: number | null;
  currency: string | null;
};

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Expect a table like: portfolio_snapshots(user_id, total_value, currency, created_at)
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("id, created_at, user_id, total_value, currency")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(90);

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to load snapshots. (Check table: portfolio_snapshots)",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ snapshots: (data ?? []) as SnapshotRow[] }, { status: 200 });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { total_value?: number; currency?: string }
    | null;

  const totalValue =
    typeof body?.total_value === "number" ? body.total_value : null;
  const currency = body?.currency ? String(body.currency).toUpperCase() : null;

  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .insert({
      user_id: user.id,
      total_value: totalValue,
      currency,
    })
    .select("id, created_at, user_id, total_value, currency")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to create snapshot. (Check table: portfolio_snapshots)",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ snapshot: data as SnapshotRow }, { status: 201 });
}