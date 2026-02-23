// app/api/news/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COUNTRY_MAP: Record<string, string> = {
  world: "us", // NewsAPI forces a country for /top-headlines. We'll treat world as "us" unless you switch to /everything.
  us: "us",
  jp: "jp",
  au: "au",
  cn: "cn",
  uk: "gb",
  eu: "de", // pick one; EU isn't a NewsAPI country code
  in: "in",
};

const KEYWORD_PRESETS: Record<string, string[]> = {
  markets: ["stocks", "earnings", "rates", "inflation", "futures", "oil"],
  tech: ["AI", "chip", "NVIDIA", "OpenAI", "Apple", "Google", "Microsoft"],
  geopolitics: ["Ukraine", "Taiwan", "Middle East", "sanctions", "election"],
};

function clampStr(s: string | null, max = 80) {
  const v = String(s ?? "").trim();
  return v.length > max ? v.slice(0, max) : v;
}

export async function GET(req: Request) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Missing NEWS_API_KEY" }, { status: 500 });

  const { searchParams } = new URL(req.url);

  const countryKey = clampStr(searchParams.get("country") || "world");
  const category = clampStr(searchParams.get("category") || "general");
  const q = clampStr(searchParams.get("q") || "");
  const sort = clampStr(searchParams.get("sort") || "publishedAt"); // NewsAPI supports sortBy on /everything only
  const mode = clampStr(searchParams.get("mode") || "top"); // "top" or "everything"
  const hours = Number(searchParams.get("hours") || "24");

  const country = COUNTRY_MAP[countryKey] ?? "us";

  // If you want true “world” + relevance + better search, use /everything.
  // top-headlines is “like Yahoo” but limited.
  const useEverything = mode === "everything" || countryKey === "world" || !!q;

  let url: string;

  if (useEverything) {
    const now = new Date();
    const from = new Date(now.getTime() - Math.max(1, Math.min(24 * 30, hours)) * 60 * 60 * 1000);
    const fromISO = from.toISOString();

    // Build query: search term OR category preset if category is special
    const preset =
      category in KEYWORD_PRESETS ? KEYWORD_PRESETS[category].join(" OR ") : "";
    const query = q ? q : preset ? preset : "top news";

    url =
      `https://newsapi.org/v2/everything?` +
      new URLSearchParams({
        q: query,
        language: countryKey === "jp" ? "ja" : "en",
        sortBy: sort === "relevancy" ? "relevancy" : sort === "popularity" ? "popularity" : "publishedAt",
        from: fromISO,
        pageSize: "30",
      }).toString();
  } else {
    url =
      `https://newsapi.org/v2/top-headlines?` +
      new URLSearchParams({
        country,
        category: category === "general" ? "general" : category,
        pageSize: "30",
      }).toString();
  }

  const res = await fetch(url, {
    headers: { "X-Api-Key": apiKey },
    cache: "no-store",
  });

  const j = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ error: j?.message || "News fetch failed" }, { status: res.status });
  }

  const articles = Array.isArray(j?.articles) ? j.articles : [];

  return NextResponse.json({
    ok: true,
    mode: useEverything ? "everything" : "top",
    country: countryKey,
    category,
    q,
    items: articles.map((a: any) => ({
      title: String(a?.title ?? ""),
      source: String(a?.source?.name ?? ""),
      url: String(a?.url ?? ""),
      image: String(a?.urlToImage ?? ""),
      publishedAt: String(a?.publishedAt ?? ""),
      description: String(a?.description ?? ""),
    })),
  });
}
