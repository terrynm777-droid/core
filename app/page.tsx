import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E]">
      {/* Top bar */}
      <header className="mx-auto max-w-6xl px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#22C55E] flex items-center justify-center text-white font-bold">
            C
          </div>
          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-tight">CORE</div>
            <div className="text-xs text-[#4B5A55]">Signal over noise</div>
          </div>
        </div>

        {/* Language switch (static for now) */}
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-xl border border-[#D7E4DD] bg-white text-sm hover:shadow-sm">
            🇺🇸 EN
          </button>
          <button className="px-3 py-2 rounded-xl border border-[#D7E4DD] bg-white text-sm hover:shadow-sm">
            🇯🇵 日本語
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-10">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Markets, news, and discussion—{" "}
              <span className="text-[#16A34A]">clean and calm.</span>
            </h1>

            <p className="mt-4 text-base md:text-lg text-[#3E4C47] max-w-xl">
              CORE is a social platform for people who want clarity: live market
              signals, searchable stocks, and conversations that stay grounded
              in evidence—not hype.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/waitlist"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-[#22C55E] text-white font-medium hover:brightness-95 shadow-sm"
              >
                Enter Chat
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-[#BFE8CF] bg-white text-[#0B0F0E] font-medium hover:shadow-sm"
              >
                Learn more
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
                Verified reasoning (future)
              </span>
            </div>

            <p className="mt-4 text-xs text-[#6B7A74]">
              Email login. No spam. Leave anytime.
            </p>
          </div>

          {/* Right side: market vibe mock */}
          <div className="rounded-3xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Trending</div>
              <div className="text-xs text-[#6B7A74]">Mock data (for now)</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { t: "AAPL", p: "+1.2%" },
                { t: "NVDA", p: "+2.8%" },
                { t: "TSLA", p: "-0.7%" },
                { t: "MSFT", p: "+0.4%" },
              ].map((x) => (
                <div
                  key={x.t}
                  className="rounded-2xl border border-[#E5EFEA] bg-[#F4FBF6] p-4"
                >
                  <div className="text-sm font-semibold">{x.t}</div>
                  <div className="text-xs text-[#3E4C47] mt-1">{x.p}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold">Today’s headlines</div>
              <div className="mt-3 space-y-3">
                {[
                  "Rates, inflation, and what markets are pricing now",
                  "Earnings week: what matters vs what’s noise",
                  "AI trade: separating narrative from numbers",
                ].map((h) => (
                  <div
                    key={h}
                    className="rounded-2xl border border-[#E5EFEA] bg-white p-4"
                  >
                    <div className="text-sm">{h}</div>
                    <div className="text-xs text-[#6B7A74] mt-1">
                      Tap later → opens the chat thread (future)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 pb-10 pt-6 text-xs text-[#6B7A74] flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} CORE</div>
        <div className="flex gap-4">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/waitlist" className="hover:underline">
            Waitlist
          </Link>
        </div>
      </footer>
    </main>
  );
}