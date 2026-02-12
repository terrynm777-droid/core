import Link from "next/link";

export default function DmPage({ params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username);

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-xl space-y-4">
        <Link
          href={`/u/${encodeURIComponent(username)}`}
          className="inline-flex items-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
        >
          Back to profile
        </Link>

        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">DM @{username}</div>
          <div className="mt-2 text-sm text-[#6B7A74]">
            DM isn’t implemented yet. This page is a placeholder so your UI works.
          </div>
        </div>
      </div>
    </main>
  );
}