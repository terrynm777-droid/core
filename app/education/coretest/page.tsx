import Link from "next/link";

const examLevels = [
  {
    title: "Foundation",
    desc: "Basic stock market understanding, vocabulary, market structure, and beginner literacy.",
  },
  {
    title: "Intermediate",
    desc: "Company analysis, earnings understanding, risk logic, and practical reasoning.",
  },
  {
    title: "Advanced",
    desc: "Serious investing/trading frameworks, scenario analysis, and higher-order decision quality.",
  },
];

export default function CoreTestPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] px-3 py-1 text-sm font-medium inline-flex">
            Paid
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">CORETEST / CORE検定</h1>
          <p className="mt-4 text-lg leading-8 text-[#4B5B55]">
            A formal testing layer designed to verify real stock knowledge through structured exams and progression.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {examLevels.map((level) => (
            <div
              key={level.title}
              className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm"
            >
              <div className="text-xl font-semibold">{level.title}</div>
              <p className="mt-3 text-sm leading-6 text-[#4B5B55]">{level.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-[#D7E4DD] bg-white p-8 shadow-sm">
          <div className="text-2xl font-semibold">Planned exam structure</div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E6EEE9]">
                  <th className="py-3 pr-4">Feature</th>
                  <th className="py-3 pr-4">Foundation</th>
                  <th className="py-3 pr-4">Intermediate</th>
                  <th className="py-3 pr-4">Advanced</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#F0F4F1]">
                  <td className="py-3 pr-4">Question style</td>
                  <td className="py-3 pr-4">MCQ</td>
                  <td className="py-3 pr-4">MCQ + reasoning</td>
                  <td className="py-3 pr-4">Reasoning-heavy</td>
                </tr>
                <tr className="border-b border-[#F0F4F1]">
                  <td className="py-3 pr-4">Time pressure</td>
                  <td className="py-3 pr-4">Low</td>
                  <td className="py-3 pr-4">Medium</td>
                  <td className="py-3 pr-4">High</td>
                </tr>
                <tr className="border-b border-[#F0F4F1]">
                  <td className="py-3 pr-4">Certificate</td>
                  <td className="py-3 pr-4">Yes</td>
                  <td className="py-3 pr-4">Yes</td>
                  <td className="py-3 pr-4">Yes</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Planned range</td>
                  <td className="py-3 pr-4">¥3,000</td>
                  <td className="py-3 pr-4">¥6,000</td>
                  <td className="py-3 pr-4">¥12,000</td>
                </tr>
              </tbody>
            </table>
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