import { NextResponse } from "next/server";

export const revalidate = 60;

type FinnhubNewsItem = {
  id: number;
  headline: string;
  source: string;
  url: string;
  datetime: number;
  image?: string;
  summary?: string;
};

export async function GET() {
  const key = process.env.FINNHUB_API_KEY;

  if (!key) {
    return NextResponse.json(
      { error: "Missing FINNHUB_API_KEY" },
      { status: 500 }
    );
  }

  const url = `https://finnhub.io/api/v1/news?category=general&token=${encodeURIComponent(
    key
  )}`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Finnhub error: ${res.status}` },
      { status: 500 }
    );
  }

  const data = (await res.json()) as FinnhubNewsItem[];

  // Return a small, clean payload for UI
  const items = (data ?? [])
    .filter((x) => x?.headline && x?.url)
    .slice(0, 8)
    .map((x) => ({
      id: x.id,
      headline: x.headline,
      source: x.source,
      url: x.url,
      datetime: x.datetime,
      image: x.image ?? null,
      summary: x.summary ?? null,
    }));

  return NextResponse.json(items);
}