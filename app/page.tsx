import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import TrendingLive from "./components/TrendingLive";
import StockSearchHome from "./components/StockSearchHome";
import HeadlinesLive from "./components/HeadlinesLive";

export default function Home({
  searchParams,
}: {
  searchParams?: { code?: string; next?: string };
}) {
  // If Supabase ever sends users back to "/" with ?code=..., forward into our real callback.
  const code = searchParams?.code;
  if (code) {
    const next = searchParams?.next ?? "/feed";
    redirect(
      `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(
        next
      )}`
    );
  }

  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E]">
      {/* Top bar */}
      <header className="relative mx-auto max-w-6xl px-6 pt-6 flex items-start justify-end">
        {/* ABSOLUTE: banner wordmark at super top-left */}
        <div className="absolute left-0 top-0 -translate-x-3 -translate-y-3">
          <div className="rounded-3xl bg-[#F7FAF8] p-2.5 border border-[#D7E4DD] shadow-[0_1px_0_rgba(11,15,14,0.04)]">
            <Image
              src="/brand/core-logo.png"
              alt="CORE"
              width={190}
              height={52}
              priority
            />
          </div>
        </div>

        {/* RIGHT: icon + language */}
        <div className="flex items-center gap-3">
          <div className="rounded-3xl bg-[#F7FAF8] p-2 border border-[#D7E4DD] shadow-[0_1px_0_rgba(11,15,14,0.04)]">
            <Image
              src="/brand/core-mark.png"
              alt="CORE mark"
              width={56}
              height={56}
              className="rounded-2xl"
              priority
            />
          </div>

          <button
            type="button"
            className="px-3 py-2 rounded-xl border border-[#D7E4DD] bg-white text-sm hover:shadow-sm"
          >
            🇺🇸 EN
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-xl border border-[#D7E4DD] bg-white text-sm hover:shadow-sm"
          >
            🇯🇵 日本語
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-10">
        <div className="grid gap-10 md:grid-cols-2 items-start">
          {/* Left copy */}
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Markets, news, and discussion—{" "}
              <span className="text-[#16A34A]">clean and calm.</span>
            </h1>

            <p className="mt-4 text-base md:text-lg text-[#3E4C47] max-w-xl">
              CORE is a social platform for people who want clarity: live market
              signals, searchable stocks, and conversations grounded in evidence
              — not hype.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth?next=/feed&mode=signup"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-[#22C55E] text-white font-medium hover:brightness-95 shadow-sm"
              >
                New here? Sign up
              </Link>

              <Link
                href="/auth?next=/feed&mode=login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-[#BFE8CF] bg-white text-[#0B0F0E] font-medium hover:shadow-sm"
              >
                Log in
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-[#D7E4DD] bg-white text-[#0B0F0E] font-medium hover:shadow-sm"
              >
                Learn more
              </Link>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth?next=/education&mode=signup"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-[#0B0F0E] text-white font-medium hover:brightness-95 shadow-sm"
              >
                Start learning
              </Link>

              <Link
                href="/auth?next=/education&mode=login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-[#D7E4DD] bg-white text-[#0B0F0E] font-medium hover:shadow-sm"
              >
                CORE Education
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-sm text-[#3E4C47]">
              <span className="px-3 py-1 rounded-full bg-white border border-[#D7E4DD]">
                Live news + prices
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#D7E4DD]">
                Stock search
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#D7E4DD]">
                Calm, high-signal discussion
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#D7E4DD]">
                CORE Verified (future)
              </span>
            </div>
          </div>

          {/* Right panel */}
          <div className="rounded-3xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
            {/* Trending */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Trending</div>
              <div className="text-xs text-[#6B7A74]">Live</div>
            </div>
            <TrendingLive />

            {/* Stock search */}
            <div className="mt-6">
              <div className="text-sm font-semibold">Stock search</div>
              <StockSearchHome />
            </div>

            {/* Headlines (LIVE) */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Today’s headlines</div>
                <div className="text-xs text-[#6B7A74]">Live</div>
              </div>
              <div className="mt-3">
                <HeadlinesLive />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE Education section */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-[32px] border border-[#D7E4DD] bg-white p-8 shadow-sm">
          <div className="max-w-3xl">
            <div className="text-sm font-semibold text-[#16A34A]">
              CORE Education
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Learn stocks properly from zero — then go deeper.
            </h2>
            <p className="mt-4 text-base md:text-lg text-[#3E4C47] leading-8">
              CORELEARN is the free entry point for beginners in Japan and beyond.
              Start from absolute zero in English or Japanese. Later, unlock
              advanced tracks through COREACADEMY and formal assessment through
              CORETEST / CORE検定.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-[#D7E4DD] bg-[#F7FAF8] p-6">
              <div className="text-xl font-semibold">CORELEARN</div>
              <div className="mt-1 text-sm text-[#6B7A74]">Free foundation</div>
              <p className="mt-4 text-sm leading-6 text-[#3E4C47]">
                Start from zero. Learn what stocks, markets, risk, news, and
                basic analysis actually mean.
              </p>
              <div className="mt-5 text-sm font-medium text-[#16A34A]">Free</div>
            </div>

            <div className="rounded-3xl border border-[#D7E4DD] bg-[#F7FAF8] p-6">
              <div className="text-xl font-semibold">COREACADEMY</div>
              <div className="mt-1 text-sm text-[#6B7A74]">Advanced serious learning</div>
              <p className="mt-4 text-sm leading-6 text-[#3E4C47]">
                Professional-level education for serious traders and investors:
                strategies, frameworks, macro, risk, psychology, Python, and more.
              </p>
              <div className="mt-5 text-sm font-medium text-[#0B0F0E]">
                ¥9,800–¥29,800+
              </div>
            </div>

            <div className="rounded-3xl border border-[#D7E4DD] bg-[#F7FAF8] p-6">
              <div className="text-xl font-semibold">CORETEST / CORE検定</div>
              <div className="mt-1 text-sm text-[#6B7A74]">Assessment and certification</div>
              <p className="mt-4 text-sm leading-6 text-[#3E4C47]">
                Formal testing and certification layer to verify actual knowledge,
                not fake confidence.
              </p>
              <div className="mt-5 text-sm font-medium text-[#0B0F0E]">
                ¥3,000–¥12,000
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth?next=/education&mode=signup"
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-[#22C55E] text-white font-medium hover:brightness-95 shadow-sm"
            >
              Start learning
            </Link>

            <Link
              href="/auth?next=/education&mode=login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-[#D7E4DD] bg-white text-[#0B0F0E] font-medium hover:shadow-sm"
            >
              View education hub
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 pb-10 pt-6 text-xs text-[#6B7A74] flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} CORE</div>
        <div className="flex gap-4"></div>
      </footer>
    </main>
  );
}