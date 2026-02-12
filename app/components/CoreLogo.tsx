"use client";

import Image from "next/image";
import Link from "next/link";

export default function CoreLogo() {
  return (
    <Link
      href="/"
      className="fixed right-6 top-5 z-[9999] inline-flex items-center rounded-full bg-white/80 px-3 py-2 shadow-sm backdrop-blur border border-[#D7E4DD] hover:shadow"
      aria-label="Go to home"
      title="Home"
    >
      <Image
        src="/brand/core-logo.png"
        alt="CORE"
        width={92}
        height={24}
        priority
      />
    </Link>
  );
}