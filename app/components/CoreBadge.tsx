import Link from "next/link";

export default function CoreBadge() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Link
        href="/feed"
        className="rounded-full border border-[#D7E4DD] bg-white px-3 py-1 text-xs font-semibold tracking-widest text-[#0B0F0E] shadow-sm hover:shadow"
      >
        CORE
      </Link>
    </div>
  );
}