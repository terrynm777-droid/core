import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clampStr(s: string | null, max = 300) {
  const v = String(s ?? "").trim();
  return v.length > max ? v.slice(0, max) : v;
}

type GNewsArticle = {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  source?: { name?: string; url?: string };
};

export async function GET(req: Request) {
  const key = process.env.GNEWS_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Missing GNEWS_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);

  const q = clampStr(searchParams.get("q") || "", 200); // optional search
  const pageSize = Math.max(1, Math.min(50, Number(searchParams.get("pageSize") || "30")));

  // GNews:
  // - top-headlines: country=jp&lang=ja for Japanese headlines
  // - search: /search?q=...&lang=ja
  const base = q ? "https://gnews.io/api/v4/search" : "https://gnews.io/api/v4/top-headlines";

  const sp = new URLSearchParams();
  sp.set("token", key);
  sp.set("max", String(pageSize));
  sp.set("lang", "ja");

  if (q) {
    sp.set("q", q);
    // optional: narrow to Japan sources; keep it open by default
    // sp.set("country", "jp");
  } else {
    sp.set("country", "jp");
  }

  const url = `${base}?${sp.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  let j: any = null;
  try {
    j = text ? JSON.parse(text) : null;
  } catch {}

  if (!res.ok) {
    return NextResponse.json(
      { error: j?.errors?.[0] || j?.message || text || "GNews fetch failed" },
      { status: res.status }
    );
  }

  const articles: GNewsArticle[] = Array.isArray(j?.articles) ? j.articles : [];

  const items = articles
    .map((a) => ({
      title: String(a?.title ?? ""),
      source: String(a?.source?.name ?? ""),
      url: String(a?.url ?? ""),
      image: String(a?.image ?? ""),
      publishedAt: String(a?.publishedAt ?? ""),
      description: String(a?.description ?? a?.content ?? ""),
    }))
    .filter((it) => it.url && it.title);

  return NextResponse.json({
    ok: true,
    provider: "gnews",
    lang: "ja",
    country: q ? "any" : "jp",
    q,
    items,
  });
}