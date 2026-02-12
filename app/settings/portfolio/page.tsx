import Link from "next/link";
import PortfolioEditor from "./ui/PortfolioEditor";

export const dynamic = "force-dynamic";

export default function PortfolioSettingsPage() {
  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#6B7A74]">
              CORE
            </div>
            <h1 className="mt-2 text-2xl font-semibold">Edit portfolio</h1>
            <p className="mt-2 text-sm text-[#6B7A74]">
              Add holdings and choose whether your portfolio is public.
            </p>
          </div>

          <Link
            href="/settings/profile"
            className="inline-flex items-center justify-center rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Back
          </Link>
        </div>

        <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
          <PortfolioEditor />
        </div>
      </div>
    </main>
  );
}
