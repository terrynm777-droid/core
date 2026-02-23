import Link from "next/link";
import { usePathname } from "next/navigation";

export function LeftNav() {
  const pathname = usePathname();
  const active = (href: string) => (pathname?.startsWith(href) ? "bg-[#EAF2EE] text-[#0B0F0E]" : "text-[#4B5B55]");

  return (
    <div className="w-64 border-r border-[#D7E4DD] bg-white p-3 space-y-2">
      {/* your existing channels */}
      <Link href="/feed" className={`block rounded-xl px-3 py-2 text-sm ${active("/feed")}`}>
        World chat
      </Link>

      {/* NEW */}
      <Link href="/news" className={`block rounded-xl px-3 py-2 text-sm font-semibold ${active("/news")}`}>
        NEWS
      </Link>

      {/* later: country chats */}
      {/* <Link href="/feed/jp">Japan chat</Link> */}
    </div>
  );
}