import Link from "next/link";
import StockPageClient from "./StockPageClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function StockPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: raw } = await params;
  const symbol = decodeURIComponent(raw || "").trim().toUpperCase();

  if (!symbol) {
    return (
      <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
        <div className="mx-auto max-w-3xl space-y-4">
          <Link
            href="/feed"
            className="inline-flex items-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Back
          </Link>
          <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Invalid symbol</div>
          </div>
        </div>
      </main>
    );
  }

  return <StockPageClient symbol={symbol} />;
}