// app/feed/layout.tsx
import Link from "next/link";

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}

      {/* Right-side floating News button */}
      <Link
        href="/news"
        className="fixed right-6 top-28 z-50 rounded-full bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
      >
        News
      </Link>
    </>
  );
}