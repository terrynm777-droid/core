// app/api/news/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FINNHUB_CATEGORY_MAP: Record<string, string> = {
  general: "general",
  top: "general",
  markets: "general",
  tech: "technology",
  business: "business",
  crypto: "crypto",
  forex: "forex",
};

function clampStr(s: string | null, max = 80) {
  const v = String(s ?? "").trim();
  return v.length > max ? v.slice(0, max) : v;
}

function scoreMatch(text: string, needles: string[]) {
  const t = text.toLowerCase();

  let score = 0;

  for (const n of needles) {
    const needle = n.toLowerCase();

    if (t.includes(needle)) score += 1;

    // extra weight if appears in title
    if (t.startsWith(needle)) score += 2;
  }

  return score;
}

export async function GET(req: Request) {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);

  const categoryKey = clampStr(searchParams.get("category") || "general");
  const q = clampStr(searchParams.get("q") || "");
  const pageSize = Math.max(1, Math.min(50, Number(searchParams.get("pageSize") || "30")));

  const finnhubCategory = FINNHUB_CATEGORY_MAP[categoryKey] ?? "general";

  const url =
    "https://finnhub.io/api/v1/news?" +
    new URLSearchParams({
      category: finnhubCategory,
      token: apiKey,
    });

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  const j = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(
      { error: (j as any)?.error || "News fetch failed" },
      { status: res.status }
    );
  }

  const raw = Array.isArray(j) ? j : [];

  let items = raw.map((a: any) => ({
    title: String(a?.headline ?? ""),
    source: String(a?.source ?? ""),
    url: String(a?.url ?? ""),
    image: String(a?.image ?? ""),
    publishedAt: a?.datetime
      ? new Date(Number(a.datetime) * 1000).toISOString()
      : "",
    description: String(a?.summary ?? ""),
  }));

  // 🔎 ADVANCED KEYWORD FILTER
  if (q) {
    const needles = q.split(/\s+/).filter(Boolean);

    items = items
      .map((it) => {
        const blob = `${it.title} ${it.description} ${it.source}`;
        const score = scoreMatch(blob, needles);
        return { ...it, _score: score };
      })
      .filter((it) => it._score > 0)
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...rest }) => rest);
  }

  // default = latest news
  else {
    items = items.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() -
        new Date(a.publishedAt).getTime()
    );
  }

  items = items.slice(0, pageSize);

  return NextResponse.json({
    ok: true,
    provider: "finnhub",
    category: categoryKey,
    q,
    items,
  });
}