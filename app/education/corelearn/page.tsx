import Link from "next/link";
import { coreLearnContent } from "./content";

export default function CoreLearnPage() {
  return (
    <main className="min-h-screen bg-[#F7FAF8] px-6 py-12 text-[#0B0F0E]">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-[#D7E4DD] bg-white px-3 py-1 text-sm font-medium text-[#16A34A]">
            Free
          </div>

          <h1 className="mt-4 text-5xl font-semibold leading-tight">CORELEARN</h1>

          <p className="mt-5 text-lg leading-8 text-[#37413D]">
            Learn stocks from zero in a clean, structured, bilingual path.
            No hype. No fake guru noise. Just proper foundations.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/education/corelearn/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-[#D7E4DD] bg-white px-5 py-3 text-sm font-medium text-[#0B0F0E] hover:bg-[#F7FAF8]"
            >
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5">
          {coreLearnContent.map((level) => (
            <div
              key={level.id}
              className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm"
            >
              <div className="text-2xl font-semibold text-[#0B0F0E]">
                {level.title}
              </div>

              <p className="mt-3 text-base leading-7 text-[#37413D]">
                {level.desc}
              </p>

              <div className="mt-5">
                <Link
                  href={`/education/corelearn/${level.id}`}
                  className="inline-flex rounded-2xl bg-[#22C55E] px-5 py-3 text-sm font-medium text-white hover:brightness-95"
                >
                  Open level
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}