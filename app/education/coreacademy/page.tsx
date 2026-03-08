import Link from "next/link";

const tracks = [
  {
    title: "Strategy Systems",
    desc: "Momentum, mean reversion, breakout logic, multi-timeframe execution, and structured trade planning.",
  },
  {
    title: "Risk & Portfolio",
    desc: "Position sizing, drawdown control, portfolio construction, scenario thinking, and risk discipline.",
  },
  {
    title: "Research & Analysis",
    desc: "Catalysts, earnings, macro, company analysis, valuation basics, and professional stock review frameworks.",
  },
  {
    title: "Python & Automation",
    desc: "Beginner-friendly Python for market data, backtesting foundations, and system thinking for serious learners.",
  },
];

export default function CoreAcademyPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] px-3 py-1 text-sm font-medium inline-flex">
            Paid
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">COREACADEMY</h1>
          <p className="mt-4 text-lg leading-8 text-[#4B5B55]">
            Advanced serious stock education for learners who want depth, systems, and professional frameworks.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {tracks.map((track) => (
            <div
              key={track.title}
              className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm"
            >
              <div className="text-xl font-semibold">{track.title}</div>
              <p className="mt-3 text-sm leading-6 text-[#4B5B55]">{track.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-[#D7E4DD] bg-white p-8 shadow-sm">
          <div className="text-2xl font-semibold">Planned pricing</div>
          <div className="mt-4 text-sm leading-7 text-[#4B5B55]">
            Beta pricing can start lower. Final pricing can scale with depth, access, support, and community layer.
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5">
              <div className="text-lg font-semibold">Starter</div>
              <div className="mt-2 text-sm text-[#6B7A74]">¥9,800</div>
              <div className="mt-3 text-sm text-[#4B5B55]">Core advanced lessons, no extras.</div>
            </div>
            <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5">
              <div className="text-lg font-semibold">Standard</div>
              <div className="mt-2 text-sm text-[#6B7A74]">¥19,800</div>
              <div className="mt-3 text-sm text-[#4B5B55]">Full track access, more frameworks, more structure.</div>
            </div>
            <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] p-5">
              <div className="text-lg font-semibold">Pro</div>
              <div className="mt-2 text-sm text-[#6B7A74]">¥29,800+</div>
              <div className="mt-3 text-sm text-[#4B5B55]">Deeper systems, Python, advanced tools, future premium layer.</div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Link
              href="/education"
              className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:bg-[#F7FAF8]"
            >
              Back
            </Link>
            <button
              type="button"
              disabled
              className="inline-flex rounded-2xl bg-[#0B0F0E] px-4 py-2 text-sm font-medium text-white opacity-60"
            >
              Locked for now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}