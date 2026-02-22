
// deploy bump
import Link from "next/link";

import TrendingLive from "./components/TrendingLive";
import StockSearchHome from "./components/StockSearchHome";
import HeadlinesLive from "./components/HeadlinesLive";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-semibold">CORE</div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/auth"
              className="rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:shadow-sm"
            >
              Sign up / Log in
            </Link>
          </div>

        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 items-start lg:items-start">
          {/* Left: hero */}
          <div className="lg:sticky lg:top-10 self-start">
            <h1 className="text-5xl font-semibold leading-tight">
              Markets, news, and discussion—{" "}
              <span className="text-[#2E9B5D]">clean and calm.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-[#2B3A35]">
              CORE is a social platform for people who want clarity: live market
              signals, searchable stocks, and conversations grounded in evidence
              — not hype.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <Link
                href="/auth"
                className="rounded-2xl bg-[#2E9B5D] px-6 py-3 text-sm font-semibold text-white hover:opacity-95"
              >
                Create account
              </Link>

              <Link
                href="/feed"
                className="rounded-2xl border border-[#D7E4DD] bg-white px-6 py-3 text-sm font-semibold hover:shadow-sm"
              >
                Enter chat
              </Link>
            </div>
          </div>

          {/* Right: widget card */}
          <div className="rounded-2xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
            <div className="space-y-6">
              <TrendingLive />
              <StockSearchHome />
              <HeadlinesLive />
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-[#93A19B]">
          Build: czrh5eet • pr-trigger
        </div>
      </div>
    </main>
  );
}
