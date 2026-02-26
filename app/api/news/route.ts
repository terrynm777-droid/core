// app/api/news/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FINNHUB_CATEGORY_MAP: Record<string, string> = {
  japan: "general",
  general: "general",
  top: "general",
  markets: "general",
  tech: "technology",
  business: "business",
  crypto: "crypto",
  forex: "forex",
};

function clampStr(s: string | null, max = 200) {
  const v = String(s ?? "").trim();
  return v.length > max ? v.slice(0, max) : v;
}

function toISOFromFinnhubDatetime(dt: any) {
  const n = Number(dt);
  if (!Number.isFinite(n) || n <= 0) return "";
  return new Date(n * 1000).toISOString();
}

const STOPWORDS = new Set([
  "or","and","the","a","an","to","of","in","on","for","with","at","by","from","as",
  "is","are","be","was","were","this","that","these","those",
]);

function normalizeNeedle(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function isOrQuery(raw: string) {
  return /\sOR\s/i.test(raw);
}

/**
 * If q contains " OR ", treat it as a list of phrases.
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
 * Expand needles for known thin categories so they actually catch wording.
 * (Only adds; never removes -> UI stays same.)
 */
function expandNeedles(categoryKey: string, needles: string[]) {
  const out = [...needles];

  if (categoryKey === "japan") {
    out.push(
      "japan","japanese","tokyo","nikkei","topix","tse","boj","bank of japan",
      "yen","jpy","usd/jpy","usdjpy","yield curve control","jgb","shunto"
    );
  }

  if (categoryKey === "crypto") {
    out.push(
      "bitcoin","btc","ethereum","eth","crypto","cryptocurrency","digital asset","stablecoin",
      "token","blockchain","exchange","binance","coinbase","sec","etf"
    );
  }

  if (categoryKey === "forex") {
    out.push(
      "fx","forex","currency","currencies","dollar","usd","yen","jpy","euro","eur","pound","gbp","aud","cad","cny",
      "dxy","usd/jpy","usdjpy","eur/usd","eurusd","aud/usd","audusd","exchange rate","rates",
      "rate hike","rate cut","treasury yields","bond yields"
    );
  }

  return Array.from(new Set(out.map((x) => normalizeNeedle(x)).filter(Boolean)));
}

/**
 * Match/score:
 * - title matches are weighted heavier than description/source
 * - count "matches" as number of distinct needles that appear anywhere
 */
function scoreItem(title: string, description: string, source: string, needles: string[]) {
  const t = (title || "").toLowerCase();
  const d = (description || "").toLowerCase();
  const s = (source || "").toLowerCase();

  let score = 0;
  let matches = 0;

  for (const rawNeedle of needles) {
    const needle = rawNeedle.toLowerCase();
    if (!needle) continue;

    const inTitle = t.includes(needle);
    const inBody = d.includes(needle) || s.includes(needle);

    if (inTitle || inBody) matches += 1;
    if (inTitle) score += 4;
    if (inBody) score += 1;
    if (t.startsWith(needle)) score += 2;
  }

  return { score, matches };
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
  if (!apiKey) {
    return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);

  // UI sends these (your backend used to ignore them). We accept + echo.
  const country = clampStr(searchParams.get("country") || "world", 30);
  const sort = clampStr(searchParams.get("sort") || "publishedAt", 30);
  const hoursRaw = clampStr(searchParams.get("hours") || "24", 10);

  // Existing params
  const categoryKey = clampStr(searchParams.get("category") || "general", 50);
  const rawQ = clampStr(searchParams.get("q") || "", 300);
  const pageSize = Math.max(1, Math.min(50, Number(searchParams.get("pageSize") || "30")));

  const finnhubCategory = FINNHUB_CATEGORY_MAP[categoryKey] ?? "general";

  const url =
    "https://finnhub.io/api/v1/news?" +
    new URLSearchParams({ category: finnhubCategory, token: apiKey }).toString();

  const res = await fetch(url, { next: { revalidate: 60 } }); // protect quota
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
    publishedAt: toISOFromFinnhubDatetime(a?.datetime),
    description: String(a?.summary ?? ""),
  }));

  // Optional time window filter (UI hours dropdown)
  const windowMs = parseHoursToMs(hoursRaw);
  if (windowMs > 0) {
    const now = Date.now();
    const cutoff = now - windowMs;
    items = items.filter((it) => {
      const t = isoToMs(it.publishedAt);
      return t === 0 ? true : t >= cutoff; // if no date, keep (don’t accidentally nuke)
    });
  }

  // Decide mode (matches your UI type)
  const mode: "top" | "everything" = rawQ.trim() ? "everything" : "top";

  // If NO q: default is latest.
  // BUT for preset categories (japan/crypto/forex), we still filter using expanded needles,
  // otherwise "Japan" looks like it does nothing.
  const isPresetCategory = categoryKey === "japan" || categoryKey === "crypto" || categoryKey === "forex";

  if (!rawQ.trim() && !isPresetCategory) {
    items = items
      .filter((it) => it.url && it.title)
      .sort((a, b) => {
        const ap = a.publishedAt || "0000";
        const bp = b.publishedAt || "0000";
        return bp.localeCompare(ap);
      })
      .slice(0, pageSize);

    return NextResponse.json({
      ok: true,
      mode,
      country,
      category: categoryKey,
      q: rawQ,
      items,
    });
  }

  // Advanced filtering when q exists OR preset category selected (even if q is empty)
  const built = buildNeedles(rawQ);
  const needles = expandNeedles(categoryKey, built.needles);

  const orMode = built.mode === "or";
  const loosened = isPresetCategory || orMode;

  // Strictness:
  // - presets + OR: allow 1 match (higher recall)
  // - everything else: require 2 matches (higher precision)
  const minMatches = loosened ? 1 : 2;

  // If q is empty and needles came only from preset expansion,
  // we still score/filter so Japan/Crypto/FX works as a “topic preset”.
  let scored = items
    .map((it) => {
      const { score, matches } = scoreItem(it.title, it.description, it.source, needles);
      return { ...it, _score: score, _matches: matches };
    })
    .filter((it: any) => it.url && it.title && it._matches >= minMatches && it._score > 0);

  // Sort handling:
  // - publishedAt: newest
  // - relevancy/popularity: score first then newest (popularity not available on Finnhub)
  if (sort === "publishedAt") {
    scored = scored.sort((a: any, b: any) => {
      const ap = a.publishedAt || "0000";
      const bp = b.publishedAt || "0000";
      return bp.localeCompare(ap);
    });
  } else {
    scored = scored.sort((a: any, b: any) => {
      if (b._score !== a._score) return b._score - a._score;
      const ap = a.publishedAt || "0000";
      const bp = b.publishedAt || "0000";
      return bp.localeCompare(ap);
    });
  }

  const finalItems = scored
    .map(({ _score, _matches, ...rest }: any) => rest)
    .slice(0, pageSize);

  return NextResponse.json({
    ok: true,
    mode: rawQ.trim() ? "everything" : "top",
    country,
    category: categoryKey,
    q: rawQ,
    items: finalItems,
  });
}