import Link from "next/link";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">

      {/* RIGHT SIDE FLOATING CHANNEL BUTTON */}
      <Link
        href="/news"
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50
                   rounded-full border border-[#D7E4DD]
                   bg-white px-4 py-3 text-sm font-medium shadow-sm
                   hover:bg-[#F3F7F5]"
      >
        News
      </Link>

      {children}
    </div>
  );
}