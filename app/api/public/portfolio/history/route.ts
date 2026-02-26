// app/api/public/portfolio/history/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SnapRow = { day: string; total_usd: number | null };

function dayKeyUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDaysUTC(d: Date, n: number) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const days = Math.max(1, Math.min(365, Number(searchParams.get("days") || "30")));

  if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });

  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
  if (!profile?.id) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id,is_public")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!portfolio?.id || !portfolio.is_public) {
    return NextResponse.json({ error: "Portfolio not public" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("day,total_usd")
    .eq("user_id", profile.id)
    .order("day", { ascending: true })
    .limit(2000)
    .returns<SnapRow[]>();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = String(r.day || "");
    const v = Number(r.total_usd ?? 0);
    if (k) map.set(k, Number.isFinite(v) ? v : 0);
  }

  const end = new Date();
  const start = addDaysUTC(end, -(days - 1));

  const points: { day: string; total_usd: number }[] = [];
  let last = 0;

  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].day <= dayKeyUTC(start)) {
      last = Number(rows[i].total_usd ?? 0) || 0;
      break;
    }
  }

  for (let i = 0; i < days; i++) {
    const d = addDaysUTC(start, i);
    const k = dayKeyUTC(d);
    if (map.has(k)) last = map.get(k)!;
    points.push({ day: k, total_usd: last });
  }

  return NextResponse.json({ points });
}