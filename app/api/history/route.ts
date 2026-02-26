import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SnapRow = { day: string; total_usd: number | null };

function dayKeyUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}
function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function addDaysUTC(d: Date, n: number) {
  const x = startOfDayUTC(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Math.max(1, Math.min(365, Number(searchParams.get("days") || "30")));

  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("day,total_usd")
    .eq("user_id", user.id)
    .order("day", { ascending: true })
    .limit(3000)
    .returns<SnapRow[]>();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = String(r.day || "");
    const v = Number(r.total_usd ?? 0);
    if (k) map.set(k, Number.isFinite(v) ? v : 0);
  }

  const end = startOfDayUTC(new Date());
  const start = addDaysUTC(end, -(days - 1));

  // carry-forward baseline: last value on/before start
  let last = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].day <= dayKeyUTC(start)) {
      last = Number(rows[i].total_usd ?? 0) || 0;
      break;
    }
  }

  const points: { day: string; total_usd: number }[] = [];
  for (let i = 0; i < days; i++) {
    const k = dayKeyUTC(addDaysUTC(start, i));
    if (map.has(k)) last = map.get(k)!;
    points.push({ day: k, total_usd: last });
  }

  return NextResponse.json({ points });
}