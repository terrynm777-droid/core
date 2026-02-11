import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.FINNHUB_API_KEY;

  if (!key) {
    return NextResponse.json(
      { error: "Missing FINNHUB_API_KEY" },
      { status: 500 }
    );
  }

  const url = `https://finnhub.io/api/v1/news?category=general&token=${key}`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Finnhub error: ${res.status}` },
      { status: 500 }
    );
  }

  const data = await res.json();

  return NextResponse.json(data);
}