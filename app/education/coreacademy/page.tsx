import Link from "next/link";

export default function CoreAcademyPage() {
  return (
    <main className="min-h-screen bg-[#F7FAF8] px-6 py-12 text-[#0B0F0E]">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <div className="text-sm font-semibold text-[#16A34A]">COREACADEMY</div>
          <h1 className="mt-4 text-5xl font-semibold leading-tight">
            Advanced serious learning
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#37413D]">
            Professional-level education for serious traders and investors:
            strategies, frameworks, macro, risk, psychology, Python, and systems.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-[#D7E4DD] bg-white p-8 shadow-sm">
          <div className="text-2xl font-semibold">What’s inside</div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Advanced strategy tracks",
              "Risk and portfolio frameworks",
              "Macro and scenario thinking",
              "Trading systems",
              "Psychology and discipline",
              "Python / algo later",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] px-4 py-4 text-sm text-[#37413D]"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="rounded-full border border-[#D7E4DD] bg-[#F7FAF8] px-4 py-2 text-sm font-medium">
              $100 / 約¥15,000
            </div>

            <Link
              href="/checkout/coreacademy"
              className="inline-flex rounded-2xl bg-[#22C55E] px-5 py-3 text-sm font-medium text-white hover:brightness-95"
            >
              Buy COREACADEMY
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}