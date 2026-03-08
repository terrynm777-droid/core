import Link from "next/link";
import { redirect } from "next/navigation";
import TrendingLive from "./components/TrendingLive";
import StockSearchHome from "./components/StockSearchHome";
import HeadlinesLive from "./components/HeadlinesLive";

export default function Home({
  searchParams,
}: {
  searchParams?: { code?: string; next?: string };
}) {
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
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-10">
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Markets, news, and discussion—{" "}
              <span className="text-[#16A34A]">clean and calm.</span>
            </h1>

            <p className="mt-4 max-w-xl text-base text-[#3E4C47] md:text-lg">
              CORE is a social platform for people who want clarity: live market
              signals, searchable stocks, and conversations grounded in evidence
              — not hype.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/education"
                className="inline-flex items-center justify-center rounded-2xl bg-[#22C55E] px-6 py-3 font-medium text-white shadow-sm hover:brightness-95"
              >
                New here? Sign up
              </Link>

              <Link
                href="/auth?next=/feed&mode=login"
                className="inline-flex items-center justify-center rounded-2xl border border-[#BFE8CF] bg-white px-6 py-3 font-medium text-[#0B0F0E] hover:shadow-sm"
              >
                Log in
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-2xl border border-[#D7E4DD] bg-white px-6 py-3 font-medium text-[#0B0F0E] hover:shadow-sm"
              >
                Learn more
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/auth?next=/education&mode=signup"
                className="inline-flex items-center justify-center rounded-2xl bg-[#22C55E] px-6 py-3 font-medium text-white shadow-sm hover:brightness-95"
              >
                Start learning
              </Link>

              <Link
                href="/education"
                className="inline-flex items-center justify-center rounded-2xl border border-[#BFE8CF] bg-white px-6 py-3 font-medium text-[#0B0F0E] hover:shadow-sm"
              >
                CORE Education
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Trending</div>
              <div className="text-xs text-[#6B7A74]">Live</div>
            </div>
            <TrendingLive />

            <div className="mt-6">
              <div className="text-sm font-semibold">Stock search</div>
              <StockSearchHome />
            </div>

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

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="rounded-[2rem] border border-[#D7E4DD] bg-white p-8 shadow-sm md:p-12">
          <div className="text-sm font-semibold text-[#16A34A]">CORE Education</div>
          <h2 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight">
            Learn stocks properly from zero — then go deeper.
          </h2>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-[#4B5B55]">
            CORELEARN is the free entry point for beginners in Japan and beyond.
            Start from absolute zero in English or Japanese. Later, unlock advanced
            tracks through COREACADEMY and formal assessment through CORETEST /
            CORE検定.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-[#D7E4DD] bg-[#F7FAF8] p-8">
              <div className="text-2xl font-semibold">CORELEARN</div>
              <div className="mt-2 text-sm text-[#6B7A74]">Free foundation</div>
              <p className="mt-6 text-base leading-8 text-[#37413D]">
                Start from zero. Learn what stocks, markets, risk, news, and basic
                analysis actually mean.
              </p>
              <div className="mt-8 text-3xl font-semibold text-[#16A34A]">Free</div>
            </div>

            <div className="rounded-3xl border border-[#D7E4DD] bg-[#F7FAF8] p-8">
              <div className="text-2xl font-semibold">COREACADEMY</div>
              <div className="mt-2 text-sm text-[#6B7A74]">Advanced serious learning</div>
              <p className="mt-6 text-base leading-8 text-[#37413D]">
                Professional-level education for serious traders and investors:
                strategies, frameworks, macro, risk, psychology, Python, and more.
              </p>
              <div className="mt-8 text-3xl font-semibold text-[#0B0F0E]">
                ¥9,800–¥29,800+
              </div>
            </div>

            <div className="rounded-3xl border border-[#D7E4DD] bg-[#F7FAF8] p-8">
              <div className="text-2xl font-semibold">CORETEST / CORE検定</div>
              <div className="mt-2 text-sm text-[#6B7A74]">Assessment and certification</div>
              <p className="mt-6 text-base leading-8 text-[#37413D]">
                Formal testing and certification layer to verify actual knowledge,
                not fake confidence.
              </p>
              <div className="mt-8 text-3xl font-semibold text-[#0B0F0E]">
                ¥3,000–¥12,000
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/education/corelearn"
              className="inline-flex items-center justify-center rounded-2xl bg-[#22C55E] px-6 py-3 font-medium text-white shadow-sm hover:brightness-95"
            >
              Start learning
            </Link>

            <Link
              href="/education"
              className="inline-flex items-center justify-center rounded-2xl border border-[#D7E4DD] bg-white px-6 py-3 font-medium text-[#0B0F0E] hover:shadow-sm"
            >
              View education hub
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-6 pb-10 pt-6 text-xs text-[#6B7A74] md:flex-row md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} CORE</div>
      </footer>
    </main>
  );
}