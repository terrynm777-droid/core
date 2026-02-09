// app/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#0B0F0E]">
      <header className="mx-auto max-w-6xl px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/core-mark.png"
            alt="CORE mark"
            width={40}
            height={40}
            className="rounded-xl"
            priority
          />
          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-tight">CORE</div>
            <div className="text-xs text-[#4B5A55]">Signal over noise</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-xl border border-[#D7E4DD] bg-white text-sm hover:shadow-sm">
            🇺🇸 EN
          </button>
          <button className="px-3 py-2 rounded-xl border border-[#D7E4DD] bg-white text-sm hover:shadow-sm">
            🇯🇵 日本語
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-14 pb-10">
        <div className="grid gap-10 md:grid-cols-2 items-center">
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
                href="/feed"
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

            <p className="mt-4 text-xs text-[#6B7A74]">
              Email login. No spam. Leave anytime.
            </p>
          </div>

          <div className="rounded-3xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Trending</div>
              <div className="text-xs text-[#6B7A74]">Mock data (for now)</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}