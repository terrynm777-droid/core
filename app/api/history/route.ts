import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SnapRow = { day: string; total_usd: number | null };
type Point = { day: string; total_usd: number };

function clampInt(n: any, lo: number, hi: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, Math.trunc(x)));
}

function dayKeyUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDaysUTC(isoDay: string, delta: number) {
  const d = new Date(`${isoDay}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return dayKeyUTC(d);
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: uerr,
  } = await supabase.auth.getUser();

  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = clampInt(searchParams.get("days"), 7, 365);
  const end = dayKeyUTC(new Date());
  const start = addDaysUTC(end, -(days - 1));

  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("day,total_usd")
    .eq("user_id", user.id)
    .gte("day", start)
    .lte("day", end)
    .order("day", { ascending: true })
    .returns<SnapRow[]>();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = String(r.day || "");
    const v = Number(r.total_usd ?? 0);
    if (k) map.set(k, Number.isFinite(v) ? v : 0);
  }

  const points: Point[] = [];
  let last = 0;

  let cur = start;
  while (cur <= end) {
    if (map.has(cur)) last = map.get(cur)!;
    points.push({ day: cur, total_usd: last });
    cur = addDaysUTC(cur, 1);
  }

  return NextResponse.json({ points }, { status: 200 });
}