// app/feed/FeedLayoutClient.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function FeedLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const sp = useSearchParams();

  const [active, setActive] = useState<"en" | "ja">(
    (sp.get("feed") === "ja" ? "ja" : "en") as "en" | "ja"
  );

  useEffect(() => {
    setActive((sp.get("feed") === "ja" ? "ja" : "en") as "en" | "ja");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function setFeed(next: "en" | "ja") {
    const params = new URLSearchParams(sp.toString());
    params.set("feed", next);
    router.replace(`${pathname}?${params.toString()}`);
  }

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
                active === "en" ? "bg-[#0B0F0E] text-white" : "hover:bg-[#F7FAF8]",
              ].join(" ")}
            >
              English
            </button>

            <button
              type="button"
              onClick={() => setFeed("ja")}
              className={[
                "mt-1 w-full text-left rounded-xl px-3 py-2 text-sm font-medium",
                active === "ja" ? "bg-[#0B0F0E] text-white" : "hover:bg-[#F7FAF8]",
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