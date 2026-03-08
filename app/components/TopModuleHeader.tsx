"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Item({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-2xl border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-[#22C55E] bg-[#E9F9EF] text-[#0B0F0E]"
          : "border-[#D7E4DD] bg-white text-[#0B0F0E] hover:bg-[#F7FAF8]",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function TopModuleHeader() {
  const pathname = usePathname();

  const isFeed = pathname.startsWith("/feed");
  const isNews = pathname.startsWith("/news");
  const isEducation = pathname.startsWith("/education");

  return (
    <div className="sticky top-0 z-40 border-b border-[#E6EEE9] bg-[#F7FAF8]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-6 py-4">
        <Item href="/feed" label="CORE Chat" active={isFeed} />
        <Item href="/news" label="News" active={isNews} />
        <Item href="/auth?next=/education" label="CORE Education" active={isEducation} />
      </div>
    </div>
  );
}