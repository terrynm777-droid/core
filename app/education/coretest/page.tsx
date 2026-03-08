import Link from "next/link";

export default function CoreTestPage() {
  return (
    <main className="min-h-screen bg-[#F7FAF8] px-6 py-12 text-[#0B0F0E]">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <div className="text-sm font-semibold text-[#16A34A]">CORETEST / CORE検定</div>
          <h1 className="mt-4 text-5xl font-semibold leading-tight">
            Assessment and certification
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#37413D]">
            Formal testing layers designed to verify real stock knowledge through
            structured exams and progression.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
            <div className="text-2xl font-semibold">Foundation</div>
            <p className="mt-4 text-base leading-7 text-[#37413D]">
              Basic stock market understanding, vocabulary, market structure, and beginner literacy.
            </p>
          </div>

          <div className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
            <div className="text-2xl font-semibold">Intermediate</div>
            <p className="mt-4 text-base leading-7 text-[#37413D]">
              Company analysis, earnings understanding, risk logic, and practical reasoning.
            </p>
          </div>

          <div className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
            <div className="text-2xl font-semibold">Advanced</div>
            <p className="mt-4 text-base leading-7 text-[#37413D]">
              Serious investing and trading frameworks, scenario analysis, and higher-order decision quality.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-[#D7E4DD] bg-white p-8 shadow-sm">
          <div className="text-2xl font-semibold">Pricing</div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E6EEE9]">
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Format</th>
                  <th className="py-3 pr-4">Price</th>
                </tr>
              </thead>
              <tbody className="text-[#37413D]">
                <tr className="border-b border-[#F0F4F1]">
                  <td className="py-3 pr-4">CORETEST</td>
                  <td className="py-3 pr-4">Online exam</td>
                  <td className="py-3 pr-4">$30 / 約¥4,500</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">CORE検定</td>
                  <td className="py-3 pr-4">Paper-style exam</td>
                  <td className="py-3 pr-4">$100 / 約¥15,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/checkout/coretest"
              className="inline-flex rounded-2xl bg-[#22C55E] px-5 py-3 text-sm font-medium text-white hover:brightness-95"
            >
              Buy CORETEST
            </Link>

            <Link
              href="/checkout/corekentei"
              className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-5 py-3 text-sm font-medium text-[#0B0F0E] hover:bg-[#F7FAF8]"
            >
              Buy CORE検定
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}