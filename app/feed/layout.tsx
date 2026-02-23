// app/feed/layout.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E]">
      {/* Top header */}
      <div className="sticky top-0 z-30 border-b border-[#D7E4DD] bg-[#F7FAF8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-end px-6 py-3">
          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-2xl bg-[#22C55E] px-5 py-2 text-sm font-semibold text-white hover:opacity-95"
            >
              Menu <span className="text-base leading-none">{open ? "▴" : "▾"}</span>
            </button>

            {open ? (
              <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-[#D7E4DD] bg-white shadow-sm">
                <Link
                  href="/news"
                  className="block px-4 py-3 text-sm font-medium hover:bg-[#F7FAF8]"
                >
                  News
                </Link>
                {/* add more options later */}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}