import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pickMeta(html: string, prop: string) {
  const re = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  const m = html.match(re);
  return m?.[1] || "";
}

function pickName(html: string, name: string) {
  const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  const m = html.match(re);
  return m?.[1] || "";
}

function pickTitle(html: string) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return (m?.[1] || "").trim();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = String(searchParams.get("url") || "").trim();
  if (!url) return NextResponse.json({ error: "missing url" }, { status: 400 });

  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "CoreLinkPreview/1.0" },
      cache: "no-store",
    });

    const html = await res.text();

    const ogTitle = pickMeta(html, "og:title");
    const ogDesc = pickMeta(html, "og:description");
    const ogImg = pickMeta(html, "og:image");
    const ogSite = pickMeta(html, "og:site_name");

    const twTitle = pickMeta(html, "twitter:title");
    const twDesc = pickMeta(html, "twitter:description");
    const twImg = pickMeta(html, "twitter:image");

    const title = ogTitle || twTitle || pickTitle(html) || url;
    const description = ogDesc || twDesc || pickName(html, "description") || "";
    const image = ogImg || twImg || "";
    const siteName = ogSite || "";

    return NextResponse.json({ url, title, description, image, siteName }, { status: 200 });
  } catch {
    return NextResponse.json({ url }, { status: 200 });
  }
}