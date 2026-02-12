import Link from "next/link";
import PortfolioEditor from "./ui/PortfolioEditor";

export default function PortfolioSettingsPage() {
  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#6B7A74]">CORE</div>
            <h1 className="mt-2 text-2xl font-semibold">Edit portfolio</h1>
            <p className="mt-1 text-sm text-[#6B7A74]">
              Create it, add holdings, and get a pie chart.
            </p>
          </div>

          <Link
            href="/feed"
            className="rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
          >
            Back
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
          <PortfolioEditor />
        </div>
      </div>
    </main>
  );
}