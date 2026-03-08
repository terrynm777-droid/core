import Link from "next/link";
import { coreLearnContent } from "./content";

export default function CoreLearnPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-2xl border border-[#D7E4DD] bg-[#E9F9EF] px-3 py-1 text-sm font-medium text-[#0B0F0E]">
            Free
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">CORELEARN</h1>
          <p className="mt-4 text-lg leading-8 text-[#4B5B55]">
            Learn stocks from zero in a clean, structured, bilingual path.
            No hype. No fake guru noise. Just proper foundations.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/education/corelearn/dashboard"
            className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:bg-[#F7FAF8]"
          >
            Open dashboard
          </Link>
        </div>

        <div className="mt-10 grid gap-5">
          {coreLearnContent.map((level) => (
            <div
              key={level.id}
              className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm"
            >
              <div className="text-xl font-semibold">{level.title}</div>
              <p className="mt-3 text-sm leading-6 text-[#4B5B55]">{level.desc}</p>
              <div className="mt-5">
                <Link
                  href={`/education/corelearn/${level.id}`}
                  className="inline-flex rounded-2xl bg-[#22C55E] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}