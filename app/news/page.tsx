// app/news/page.tsx
import NewsClient from "./ui/NewsClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function NewsPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F7FAF8]">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-4">
          <div className="text-xl font-semibold text-[#0B0F0E]">News</div>
          <div className="text-sm text-[#6B7A74]">Global headlines + filters</div>
        </div>
        <NewsClient />
      </div>
    </div>
  );
}