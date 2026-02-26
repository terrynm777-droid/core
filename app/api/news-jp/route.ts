// app/api/news-jp/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Japanese-language feed using GNews.
 * Env required: GNEWS_API_KEY
 *
 * Returns: { ok, provider:"gnews", lang:"ja", country:"jp", q, items:[...] }
 */

function clampStr(s: string | null, max = 300) {
  const v = String(s ?? "").trim();
  return v.length > max ? v.slice(0, max) : v;
}

export async function GET(req: Request) {
  const key = process.env.GNEWS_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing GNEWS_API_KEY" }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const pageSize = Math.max(1, Math.min(50, Number(searchParams.get("pageSize") || "30")));
  const q = clampStr(searchParams.get("q") || "", 300);

  // GNews:
  // - top headlines: /top-headlines?lang=ja&country=jp
  // - search: /search?q=...&lang=ja&country=jp
  const base = q ? "https://gnews.io/api/v4/search" : "https://gnews.io/api/v4/top-headlines";

  const params = new URLSearchParams({
    lang: "ja",
    country: "jp",
    max: String(pageSize),
    token: key,
  });

  if (q) params.set("q", q);

  const url = `${base}?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  const j = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ error: (j as any)?.errors?.[0] || (j as any)?.message || "JP news fetch failed" }, { status: res.status });
  }

  const articles = Array.isArray((j as any)?.articles) ? (j as any).articles : [];

  const items = articles
    .map((a: any) => ({
      title: String(a?.title ?? ""),
      source: String(a?.source?.name ?? ""),
      url: String(a?.url ?? ""),
      image: String(a?.image ?? ""),
      publishedAt: String(a?.publishedAt ?? ""),
      description: String(a?.description ?? ""),
    }))
    .filter((it: any) => it.url && it.title)
    .slice(0, pageSize);

  return NextResponse.json({ ok: true, provider: "gnews", lang: "ja", country: "jp", q, items });
}