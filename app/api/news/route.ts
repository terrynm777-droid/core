// app/api/news/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Finnhub market news is a global/mostly-English feed.
 * This route adds strict relevance filtering for topic/search presets.
 */

const FINNHUB_CATEGORY_MAP: Record<string, string> = {
  general: "general",
  top: "general",
  markets: "general", // still "general" at Finnhub level
  tech: "technology",
  business: "business",
  crypto: "crypto",
  forex: "forex",
};

function clampStr(s: string | null, max = 400) {
  const v = String(s ?? "").trim();
  return v.length > max ? v.slice(0, max) : v;
}

function toISOFromFinnhubDatetime(dt: any) {
  const n = Number(dt);
  if (!Number.isFinite(n) || n <= 0) return "";
  return new Date(n * 1000).toISOString();
}

function normalizeNeedle(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function isOrQuery(raw: string) {
  return /\sOR\s/i.test(raw);
}

const STOPWORDS = new Set([
  "or",
  "and",
  "the",
  "a",
  "an",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "at",
  "by",
  "from",
  "as",
  "is",
  "are",
  "be",
  "was",
  "were",
  "this",
  "that",
  "these",
  "those",
]);

/**
 * If q contains " OR ", treat it as phrase needles.
 * Else treat it as keyword tokens (words).
 */
function buildNeedles(rawQ: string) {
  const q = normalizeNeedle(rawQ);
  if (!q) return { needles: [] as string[], mode: "none" as const };

  if (isOrQuery(q)) {
    const phrases = q
      .split(/\s+OR\s+/i)
      .map((x) => normalizeNeedle(x))
      .filter(Boolean);
    return { needles: Array.from(new Set(phrases)), mode: "or" as const };
  }

  const words = q
    .split(/\s+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((w) => w.length >= 2)
    .filter((w) => !STOPWORDS.has(w.toLowerCase()));

  return { needles: Array.from(new Set(words)), mode: "words" as const };
}

/**
 * Expand needles for thin topics so they actually catch wording.
 * Only adds; never removes.
 */
function expandNeedles(categoryKey: string, needles: string[]) {
  const out = [...needles];

  if (categoryKey === "crypto") {
    out.push(
      "bitcoin",
      "btc",
      "ethereum",
      "eth",
      "crypto",
      "cryptocurrency",
      "digital asset",
      "stablecoin",
      "token",
      "blockchain",
      "exchange",
      "binance",
      "coinbase",
      "sec",
      "etf"
    );
  }

  if (categoryKey === "forex") {
    out.push(
      "fx",
      "forex",
      "currency",
      "currencies",
      "dollar",
      "usd",
      "yen",
      "jpy",
      "euro",
      "eur",
      "pound",
      "gbp",
      "aud",
      "cad",
      "cny",
      "dxy",
      "usd/jpy",
      "usdjpy",
      "eur/usd",
      "eurusd",
      "aud/usd",
      "audusd",
      "exchange rate",
      "rates",
      "rate hike",
      "rate cut",
      "treasury yields",
      "bond yields"
    );
  }

  return Array.from(new Set(out.map((x) => normalizeNeedle(x)).filter(Boolean)));
}

/**
 * Strict scoring:
 * - title hits weighted more than description/source
 * - count distinct needle matches for title/body separately
 */
function scoreItem(title: string, description: string, source: string, needles: string[]) {
  const t = (title || "").toLowerCase();
  const d = (description || "").toLowerCase();
  const s = (source || "").toLowerCase();

  let score = 0;
  let titleMatches = 0;
  let bodyMatches = 0;

  for (const rawNeedle of needles) {
    const needle = rawNeedle.toLowerCase();
    if (!needle) continue;

    const inTitle = t.includes(needle);
    const inBody = d.includes(needle) || s.includes(needle);

    if (inTitle) {
      titleMatches += 1;
      score += 6;
      if (t.startsWith(needle)) score += 2;
    }
    if (inBody) {
      bodyMatches += 1;
      score += 2;
    }
  }

  const matches = titleMatches + bodyMatches;
  return { score, matches, titleMatches, bodyMatches };
}

function parseHoursToMs(hoursRaw: string) {
  const h = Number(hoursRaw);
  if (!Number.isFinite(h) || h <= 0) return 0;
  return h * 60 * 60 * 1000;
}

function isoToMs(iso: string) {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export async function GET(req: Request) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });

  const { searchParams } = new URL(req.url);

  const categoryKey = clampStr(searchParams.get("category") || "general", 50);
  const rawQ = clampStr(searchParams.get("q") || "", 600);
  const sort = clampStr(searchParams.get("sort") || "publishedAt", 30);
  const hoursRaw = clampStr(searchParams.get("hours") || "24", 10);
  const country = clampStr(searchParams.get("country") || "world", 30); // accepted + echoed only
  const pageSize = Math.max(1, Math.min(50, Number(searchParams.get("pageSize") || "30")));

  const finnhubCategory = FINNHUB_CATEGORY_MAP[categoryKey] ?? "general";

  const url =
    "https://finnhub.io/api/v1/news?" +
    new URLSearchParams({ category: finnhubCategory, token: apiKey }).toString();

  const res = await fetch(url, { next: { revalidate: 60 } });
  const j = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json({ error: (j as any)?.error || "News fetch failed" }, { status: res.status });
  }

  let items = (Array.isArray(j) ? j : []).map((a: any) => ({
    title: String(a?.headline ?? ""),
    source: String(a?.source ?? ""),
    url: String(a?.url ?? ""),
    image: String(a?.image ?? ""),
    publishedAt: toISOFromFinnhubDatetime(a?.datetime),
    description: String(a?.summary ?? ""),
  }));

  // Optional time window filter
  const windowMs = parseHoursToMs(hoursRaw);
  if (windowMs > 0) {
    const now = Date.now();
    const cutoff = now - windowMs;
    items = items.filter((it) => {
      const t = isoToMs(it.publishedAt);
      return t === 0 ? true : t >= cutoff;
    });
  }

  const q = rawQ.trim();
  const mode: "top" | "everything" = q ? "everything" : "top";

  // If no q: just return latest (no filtering)
  if (!q) {
    const latest = items
      .filter((it) => it.url && it.title)
      .sort((a, b) => (b.publishedAt || "0000").localeCompare(a.publishedAt || "0000"))
      .slice(0, pageSize);

    return NextResponse.json({ ok: true, provider: "finnhub", mode, country, category: categoryKey, q, items: latest });
  }

  // Strict filtering when q exists
  const built = buildNeedles(q);
  const needles = expandNeedles(categoryKey, built.needles);

  // STRICT RULE (fixes “everything shows”):
  // Pass if either:
  //   (A) titleMatches >= 1 AND total matches >= 2
  //   (B) total matches >= 3
  const scored = items
    .map((it) => {
      const r = scoreItem(it.title, it.description, it.source, needles);
      return { ...it, _score: r.score, _matches: r.matches, _titleMatches: r.titleMatches };
    })
    .filter((it: any) => {
      if (!it.url || !it.title) return false;
      const A = it._titleMatches >= 1 && it._matches >= 2;
      const B = it._matches >= 3;
      return (A || B) && it._score >= 8;
    })
    .sort((a: any, b: any) => {
      if (sort === "publishedAt") {
        return (b.publishedAt || "0000").localeCompare(a.publishedAt || "0000");
      }
      // relevancy/popularity => score then newest
      if (b._score !== a._score) return b._score - a._score;
      return (b.publishedAt || "0000").localeCompare(a.publishedAt || "0000");
    })
    .slice(0, pageSize)
    .map(({ _score, _matches, _titleMatches, ...rest }: any) => rest);

  return NextResponse.json({ ok: true, provider: "finnhub", mode, country, category: categoryKey, q, items: scored });
}