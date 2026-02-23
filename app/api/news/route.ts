// app/api/news/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FINNHUB_CATEGORY_MAP: Record<string, string> = {
  general: "general",
  top: "general",
  markets: "general", // finnhub doesn't have "markets" as a category; general is closest
  tech: "technology",
  business: "business",
  crypto: "crypto",
  forex: "forex",
  politics: "general",
};

const COUNTRY_KEYWORDS: Record<string, string[]> = {
  world: [],

  us: ["United States", "U.S.", "US", "America", "Washington", "New York", "California"],
  jp: ["Japan", "Tokyo", "Osaka", "Yen", "JPY"],
  au: ["Australia", "Sydney", "Melbourne", "Canberra", "AUD"],
  cn: ["China", "Beijing", "Shanghai", "Hong Kong", "CN", "CNY", "Yuan"],
  uk: ["United Kingdom", "UK", "Britain", "London", "GBP"],
  eu: ["Europe", "European Union", "EU", "Germany", "France", "ECB", "Euro", "EUR"],
  in: ["India", "New Delhi", "Mumbai", "RBI", "INR"],
};

function clampStr(s: string | null, max = 80) {
  const v = String(s ?? "").trim();
  return v.length > max ? v.slice(0, max) : v;
}

function includesAny(hay: string, needles: string[]) {
  const t = hay.toLowerCase();
  return needles.some((n) => t.includes(n.toLowerCase()));
}

export async function GET(req: Request) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);

  const countryKey = clampStr(searchParams.get("country") || "world");
  const categoryKey = clampStr(searchParams.get("category") || "general");
  const q = clampStr(searchParams.get("q") || "");
  const pageSize = Math.max(1, Math.min(50, Number(searchParams.get("pageSize") || "30")));

  const finnhubCategory = FINNHUB_CATEGORY_MAP[categoryKey] ?? "general";
  const url =
    "https://finnhub.io/api/v1/news?" +
    new URLSearchParams({
      category: finnhubCategory,
      token: apiKey,
    }).toString();

  const res = await fetch(url, {
    // Finnhub is fine with server-side fetch; do NOT "no-store" spam-refresh
    next: { revalidate: 60 }, // 1 min cache to protect quota
  });

  const j = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(
      { error: (j as any)?.error || "News fetch failed" },
      { status: res.status }
    );
  }

  const raw = Array.isArray(j) ? j : [];
  const countryNeedles = COUNTRY_KEYWORDS[countryKey] ?? [];
  const qNeedles = q ? q.split(/\s+/).filter(Boolean) : [];

  // Finnhub fields: headline, source, url, image, datetime, summary, category, related
  let items = raw.map((a: any) => ({
    title: String(a?.headline ?? ""),
    source: String(a?.source ?? ""),
    url: String(a?.url ?? ""),
    image: String(a?.image ?? ""),
    publishedAt: a?.datetime ? new Date(Number(a.datetime) * 1000).toISOString() : "",
    description: String(a?.summary ?? ""),
  }));

  // Keyword search (best-effort; Finnhub doesn't support query server-side)
  if (qNeedles.length) {
    items = items.filter((it) => {
      const blob = `${it.title} ${it.description} ${it.source}`;
      return includesAny(blob, qNeedles);
    });
  }

  // Country filter (best-effort keyword-based)
  if (countryNeedles.length) {
    items = items.filter((it) => {
      const blob = `${it.title} ${it.description}`;
      return includesAny(blob, countryNeedles);
    });
  }

  items = items.slice(0, pageSize);

  return NextResponse.json({
    ok: true,
    provider: "finnhub",
    country: countryKey,
    category: categoryKey,
    q,
    items,
  });
}