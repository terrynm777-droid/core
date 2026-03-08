"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function itemClass(active: boolean) {
  return [
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition",
    active
      ? "bg-[#22C55E] text-white shadow-sm"
      : "border border-[#CFE1D8] bg-[#F3F8F5] text-[#0B0F0E] hover:bg-white",
  ].join(" ");
}

export default function TopModuleHeader() {
  const pathname = usePathname();

  if (pathname.startsWith("/auth")) return null;

  const isChat = pathname.startsWith("/feed");
  const isNews = pathname.startsWith("/news");
  const isEducation = pathname.startsWith("/education");

  return (
    <header className="sticky top-0 z-50 border-b border-[#D7E4DD] bg-[#EEF6F1]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-2xl border border-[#D7E4DD] bg-white px-4 py-3 shadow-[0_1px_0_rgba(11,15,14,0.04)]"
        >
          <Image
            src="/brand/core-mark.png"
            alt="CORE"
            width={40}
            height={40}
            className="rounded-xl"
            priority
          />
          <Image
            src="/brand/core-logo.png"
            alt="CORE"
            width={110}
            height={30}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          <Link href="/feed" className={itemClass(isChat)}>
            Chat
          </Link>
          <Link href="/news" className={itemClass(isNews)}>
            News
          </Link>
          <Link href="/education" className={itemClass(isEducation)}>
            Education
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm font-medium hover:bg-[#F3F7F5]"
          >
            🇺🇸 EN
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl border border-[#D7E4DD] bg-white px-3 py-2 text-sm font-medium hover:bg-[#F3F7F5]"
          >
            🇯🇵 日本語
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-3 px-6 pb-4 md:hidden">
        <Link href="/feed" className={itemClass(isChat)}>
          Chat
        </Link>
        <Link href="/news" className={itemClass(isNews)}>
          News
        </Link>
        <Link href="/education" className={itemClass(isEducation)}>
          Education
        </Link>
      </div>
    </header>
  );
}