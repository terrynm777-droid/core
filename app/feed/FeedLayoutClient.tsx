"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function FeedLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const sp = useSearchParams();

  // derive active from URL every render (no state, no effect = no stale highlight)
  const active = (sp.get("feed") === "ja" ? "ja" : "en") as "en" | "ja";

  function setFeed(next: "en" | "ja") {
    const params = new URLSearchParams(sp.toString());
    params.set("feed", next);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const ACTIVE = "bg-[#22C55E] text-white";
  const INACTIVE = "hover:bg-[#F7FAF8]";

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="grid grid-cols-[220px_1fr] gap-6">
          <aside className="sticky top-6 h-[calc(100vh-48px)] rounded-2xl border border-[#D7E4DD] bg-white p-3">
            <div className="px-2 py-2 text-xs font-semibold text-[#6B7A74]">Regions</div>

            <button
              type="button"
              onClick={() => setFeed("en")}
              className={[
                "w-full text-left rounded-xl px-3 py-2 text-sm font-medium",
                active === "en" ? "bg-[#22C55E] text-white" : "text-[#0B0F0E] hover:bg-[#F7FAF8]",
              ].join(" ")}
            >
              English
            </button>

            <button
              type="button"
              onClick={() => setFeed("ja")}
              className={[
                "mt-1 w-full text-left rounded-xl px-3 py-2 text-sm font-medium",
                active === "ja" ? "bg-[#22C55E] text-white" : "text-[#0B0F0E] hover:bg-[#F7FAF8]",
              ].join(" ")}
            >
              日本語
            </button>

            <div className="mt-4 border-t border-[#E6EEE9] pt-3">
              <Link
                href={`/news?feed=${active}`}
                className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-[#F7FAF8]"
              >
                News
              </Link>
            </div>
          </aside>

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}