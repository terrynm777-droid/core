"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

function NavItem({
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
        "relative px-1 py-2 text-[17px] font-medium transition",
        active ? "text-[#16A34A]" : "text-[#0B0F0E] hover:text-[#16A34A]",
      ].join(" ")}
    >
      {label}
      <span
        className={[
          "absolute left-0 right-0 -bottom-[10px] h-[2px] rounded-full transition",
          active ? "bg-[#16A34A]" : "bg-transparent",
        ].join(" ")}
      />
    </Link>
  );
}

export default function TopModuleHeader() {
  const pathname = usePathname();

  const isChat = pathname.startsWith("/feed");
  const isNews = pathname.startsWith("/news");
  const isEducation = pathname.startsWith("/education");

  return (
    <header className="sticky top-0 z-50 border-b border-[#D7E4DD] bg-[#EEF4F0]/95 backdrop-blur">
      <div className="mx-auto flex h-[82px] max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/core-logo.png"
            alt="CORE"
            width={150}
            height={42}
            priority
            className="h-auto w-[150px]"
          />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <NavItem href="/feed" label="Chat" active={isChat} />
          <NavItem href="/news" label="News" active={isNews} />
          <NavItem href="/education" label="Education" active={isEducation} />
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium text-[#0B0F0E] hover:bg-[#F7FAF8]"
          >
            🇺🇸 EN
          </button>
          <button
            type="button"
            className="rounded-full border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium text-[#0B0F0E] hover:bg-[#F7FAF8]"
          >
            🇯🇵 日本語
          </button>
        </div>
      </div>
    </header>
  );
}